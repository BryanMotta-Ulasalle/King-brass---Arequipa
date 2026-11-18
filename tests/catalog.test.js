import test from 'node:test'
import assert from 'node:assert/strict'
import { createCatalogStore, parseCatalog, parseCsv, parsePrice, toMenu } from '../src/catalog.js'
import { branches, buildWhatsAppLink } from '../src/menu.js'

const headers = 'id,nombre,descripcion,precio,categoria,disponible\n'
const csv = headers + 'brasa-entero,Pollo entero,"Papas, ensalada","S/ 70,00",A la brasa,SI\n'
const config = { csvUrl: 'https://example.test/catalog.csv', refreshMs: 600000, timeoutMs: 20, cacheVersion: 1 }
const key = 'kingbras:catalog:' + config.csvUrl
const response = (text = csv) => ({ ok: true, text: async () => text })
function memory() {
  const values = new Map()
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), values }
}
function cached(storage, updatedAt, products = parseCatalog(csv)) {
  storage.setItem(key, JSON.stringify({ version: 1, url: config.csvUrl, updatedAt, products }))
}

test('CSV admite BOM, comas, saltos y comillas escapadas', () => {
  assert.deepEqual(parseCsv('\uFEFFa,b\r\n"uno, dos","dice ""hola""\notra línea"\r\n'), [['a', 'b'], ['uno, dos', 'dice "hola"\notra línea']])
  assert.throws(() => parseCsv('"sin cerrar'))
  assert.throws(() => parseCsv('"cerrado"x'))
})
test('precios se convierten exactamente a céntimos', () => {
  for (const [text, expected] of [['S/ 70,00', 7000], ['25.5', 2550], ['0', 0], ['99999.99', 9999999]]) assert.equal(parsePrice(text), expected)
  for (const value of ['', '-1', 'NaN', '1,000.00', '2.345', '100000', '20 soles']) assert.throws(() => parsePrice(value))
})
test('valida toda la carta y rechaza filas corruptas o IDs repetidos', () => {
  assert.equal(parseCatalog(csv)[0].priceCents, 7000)
  assert.equal(parseCatalog(csv.replace(',SI', ',Sí'))[0].available, true)
  assert.equal(parseCatalog(csv.replace(',SI', ',NO'))[0].available, false)
  for (const invalid of [headers, csv + csv.split('\n')[1], csv.replace(',SI', ',TALVEZ'), csv.replace('A la brasa', 'Otra'), csv.replace('S/ 70,00', ''), csv.replace('id,nombre', 'nombre,id')]) assert.throws(() => parseCatalog(invalid))
})
test('productos nuevos tienen ilustración y no usan URLs de celdas', () => {
  const [product] = toMenu([{ ...parseCatalog(csv)[0], id: 'nuevo-producto' }])
  assert.equal(product.image, 'producto-generico')
  assert.equal(product.illustration, true)
  assert.equal(toMenu([{ ...parseCatalog(csv)[0], id: 'constructor' }])[0].image, 'producto-generico')
})
test('sin red ni caché conserva los 26 productos del respaldo', async () => {
  const store = createCatalogStore({ config, storage: memory, fetcher: async () => { throw Error('offline') } })
  await store.refresh()
  assert.equal(store.getSnapshot().source, 'backup')
  assert.equal(store.getSnapshot().products.length, 26)
  assert.equal(store.getSnapshot().failed, true)
  assert.equal(store.getSnapshot().products[0].priceCents, null)
})
test('éxito guarda datos y evita solicitudes simultáneas o demasiado frecuentes', async () => {
  let calls = 0
  let time = 1000000
  const storage = memory()
  const store = createCatalogStore({ config, storage: () => storage, now: () => time, fetcher: async () => { calls++; return response() } })
  const first = store.refresh()
  assert.equal(first, store.refresh())
  await first
  await store.refresh()
  assert.equal(calls, 1)
  assert.equal(store.getSnapshot().source, 'sheets')
  assert.equal(JSON.parse(storage.getItem(key)).products[0].priceCents, 7000)
  time += config.refreshMs
  await store.refresh()
  assert.equal(calls, 2)
})
test('caché reciente evita consultar; tras caducar se conserva ante respuestas inválidas', async () => {
  let time = 1000000
  let calls = 0
  const storage = memory()
  cached(storage, time)
  const original = storage.getItem(key)
  const store = createCatalogStore({ config, storage: () => storage, now: () => time, fetcher: async () => { calls++; return response(headers) } })
  await store.refresh()
  assert.equal(calls, 0)
  time += config.refreshMs
  await store.refresh()
  assert.equal(store.getSnapshot().source, 'cache')
  assert.equal(store.getSnapshot().stale, true)
  assert.equal(store.getSnapshot().products[0].priceCents, 7000)
  assert.equal(storage.getItem(key), original)
  await store.refresh()
  assert.equal(calls, 1)
})
test('caché corrupta, de otra hoja o versión no se usa', () => {
  for (const value of ['{invalid', JSON.stringify({ version: 2 }), JSON.stringify({ version: 1, url: 'otra', updatedAt: 100, products: parseCatalog(csv) }), JSON.stringify({ version: 1, url: config.csvUrl, updatedAt: 100, products: [] })]) {
    const storage = memory(); storage.setItem(key, value)
    const store = createCatalogStore({ config, storage: () => storage })
    store.initialize()
    assert.equal(store.getSnapshot().source, 'backup')
  }
})
test('localStorage bloqueado o lleno no impide usar datos descargados', async () => {
  const store = createCatalogStore({ config, storage: () => { throw Error('blocked') }, fetcher: async () => response() })
  await store.refresh()
  assert.equal(store.getSnapshot().source, 'sheets')
  assert.equal(store.getSnapshot().failed, false)
})
test('HTTP fallido o tiempo agotado conservan el respaldo y abortan', async () => {
  const http = createCatalogStore({ config, storage: memory, fetcher: async () => ({ ok: false }) })
  await http.refresh()
  assert.equal(http.getSnapshot().failed, true)
  let signal
  const timeout = createCatalogStore({ config, storage: memory, fetcher: (_, options) => { signal = options.signal; return new Promise(() => {}) } })
  await timeout.refresh()
  assert.equal(signal.aborted, true)
  assert.equal(timeout.getSnapshot().source, 'backup')
})
test('WhatsApp incluye cantidades, precio y suma; excluye agotados', () => {
  const url = new URL(buildWhatsAppLink(branches[0], [
    { name: 'Pollo', quantity: 2, priceCents: 2550, available: true },
    { name: 'Agotado', quantity: 1, priceCents: 9000, available: false },
  ]))
  const message = url.searchParams.get('text')
  assert.equal(url.hostname, 'wa.me')
  assert.equal(url.pathname, '/' + branches[0].phone)
  assert.match(message, /2 × Pollo · S\/ 25.50 c\/u/)
  assert.match(message, /Importe referencial: S\/ 51.00 \(sin delivery\)/)
  assert.doesNotMatch(message, /Agotado/)
  const unknown = new URL(buildWhatsAppLink(branches[0], [{ name: 'Pollo', quantity: 1, priceCents: null }])).searchParams.get('text')
  assert.match(unknown, /precio por confirmar/)
  assert.doesNotMatch(unknown, /Importe referencial/)
})
