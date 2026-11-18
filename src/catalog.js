import backup from './data/menu-backup.json' with { type: 'json' }
import { categories } from './menu.js'
import { productAssets } from './product-assets.js'
import { catalogConfig } from './catalog-config.js'

export const money = (cents) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(cents / 100)
const categoryIds = new Set(categories.slice(1).map((category) => category.id))
const categoryLabels = new Map(categories.slice(1).map((category) => [category.label.toLowerCase(), category.id]))

export function parseCsv(text) {
  const rows = []
  let row = []
  let value = ''
  let quoted = false
  let closed = false
  for (const char of text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')) {
    if (quoted) {
      if (char === '"') { quoted = false; closed = true } else { value += char }
    } else if (char === '"' && closed) {
      value += '"'
      quoted = true
      closed = false
    } else if (char === ',' || char === '\n') {
      row.push(value)
      value = ''
      closed = false
      if (char === '\n') { rows.push(row); row = [] }
    } else if (char === '"' && value === '' && !closed) {
      quoted = true
    } else {
      if (closed || char === '"') throw new Error('CSV con comillas inválidas.')
      value += char
    }
  }
  if (quoted) throw new Error('CSV incompleto.')
  row.push(value)
  rows.push(row)
  return rows.filter((cells) => cells.some((cell) => cell.trim()))
}

export function parsePrice(value) {
  const number = value.trim().replace(/^S\/\s*/i, '')
  if (!/^\d{1,5}([.,]\d{1,2})?$/.test(number)) throw new Error('Precio inválido.')
  const [whole, decimals = ''] = number.split(/[.,]/)
  return Number(whole) * 100 + Number(decimals.padEnd(2, '0'))
}

export function validateProducts(products) {
  if (!Array.isArray(products) || !products.length || products.length > 500) throw new Error('Catálogo vacío o demasiado grande.')
  const ids = new Set()
  return products.map((product) => {
    const { id, name, description, category, priceCents, available } = product ?? {}
    if (typeof id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || id.length > 64 || ids.has(id)) throw new Error('Identificador inválido o repetido.')
    if (typeof name !== 'string' || !name.trim() || name.length > 100 || typeof description !== 'string' || description.length > 300) throw new Error('Texto inválido.')
    if (!categoryIds.has(category) || !Number.isSafeInteger(priceCents) || priceCents < 0 || priceCents > 9999999 || typeof available !== 'boolean') throw new Error('Precio, categoría o disponibilidad inválidos.')
    ids.add(id)
    return { id, name: name.trim(), description: description.trim(), category, priceCents, available }
  })
}

export function parseCatalog(text) {
  if (typeof text !== 'string' || text.length > 1000000) throw new Error('Respuesta inválida.')
  const [headers, ...rows] = parseCsv(text)
  const expected = ['id', 'nombre', 'descripcion', 'precio', 'categoria', 'disponible']
  if (!headers || headers.length !== expected.length || headers.some((name, index) => name.trim() !== expected[index])) throw new Error('Cabeceras incorrectas.')
  return validateProducts(rows.map((row) => {
    if (row.length !== 6) throw new Error('Fila incompleta.')
    const [id, name, description, price, label, state] = row.map((value) => value.trim())
    const available = state.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    if (!['SI', 'NO'].includes(available)) throw new Error('Disponibilidad inválida.')
    return { id, name, description, priceCents: parsePrice(price), category: categoryLabels.get(label.toLowerCase()), available: available === 'SI' }
  }))
}

export function toMenu(products) {
  return products.map(({ description, ...product }) => ({
    ...product,
    note: description,
    ...(Object.hasOwn(productAssets, product.id) ? productAssets[product.id] : { image: 'producto-generico', illustration: true }),
  }))
}

// Each store belongs to one published sheet. Browser APIs are accessed only after hydration.
export function createCatalogStore({ config = catalogConfig, fetcher = (...args) => fetch(...args), storage = () => window.localStorage, now = Date.now } = {}) {
  const fallback = { products: toMenu(backup.products), source: 'backup', updatedAt: backup.updatedAt, stale: true, failed: false }
  let state = fallback
  let pending = null
  let lastAttempt = null
  let initialized = false
  const listeners = new Set()
  const cacheKey = 'kingbras:catalog:' + config.csvUrl
  const publish = (value) => { state = value; listeners.forEach((listener) => listener()) }

  function initialize() {
    if (initialized) return
    initialized = true
    try {
      const cache = JSON.parse(storage().getItem(cacheKey))
      if (cache?.version !== config.cacheVersion || cache.url !== config.csvUrl || !Number.isFinite(cache.updatedAt) || cache.updatedAt <= 0 || cache.updatedAt > now()) return
      const products = validateProducts(cache.products)
      publish({ products: toMenu(products), source: 'cache', updatedAt: cache.updatedAt, stale: now() - cache.updatedAt >= config.refreshMs, failed: false })
    } catch { /* Storage may be blocked, missing, full, or contain an invalid snapshot. */ }
  }

  function refresh() {
    initialize()
    if (pending) return pending
    if (state.updatedAt && now() - state.updatedAt < config.refreshMs) return Promise.resolve()
    if (lastAttempt !== null && now() - lastAttempt < config.refreshMs) return Promise.resolve()
    lastAttempt = now()
    const controller = new AbortController()
    let timer
    const deadline = new Promise((_, reject) => {
      timer = setTimeout(() => { controller.abort(); reject(new Error('Tiempo de espera agotado.')) }, config.timeoutMs)
    })
    pending = (async () => {
      try {
        const products = await Promise.race([
          (async () => {
            const response = await fetcher(config.csvUrl, { signal: controller.signal, credentials: 'omit', cache: 'no-cache' })
            if (!response.ok) throw new Error('No se pudo leer el catálogo.')
            return parseCatalog(await response.text())
          })(),
          deadline,
        ])
        const updatedAt = now()
        publish({ products: toMenu(products), source: 'sheets', updatedAt, stale: false, failed: false })
        try {
          storage().setItem(cacheKey, JSON.stringify({ version: config.cacheVersion, url: config.csvUrl, updatedAt, products }))
        } catch { /* The current in-memory catalog remains usable without persistent storage. */ }
      } catch {
        publish({ ...state, stale: true, failed: true })
      } finally {
        clearTimeout(timer)
        pending = null
      }
    })()
    return pending
  }

  return {
    getSnapshot: () => state,
    getServerSnapshot: () => fallback,
    subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener) },
    initialize,
    refresh,
  }
}
