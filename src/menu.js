import backup from './data/menu-backup.json' with { type: 'json' }
import { productAssets } from './product-assets.js'

export const categories = [
  { id: 'toda', label: 'Toda la carta' },
  { id: 'brasa', label: 'A la brasa' },
  { id: 'broaster', label: 'Broaster' },
  { id: 'conos', label: 'Conos' },
  { id: 'combos', label: 'Combos y chaufa' },
  { id: 'bebidas', label: 'Bebidas' },
]

export const menu = backup.products.map((product) => ({
  id: product.id,
  name: product.name,
  ...(product.description ? { note: product.description } : {}),
  category: product.category,
  priceCents: product.priceCents,
  available: product.available,
  ...productAssets[product.id],
}))

export const branches = [
  {
    id: 'melgar',
    name: 'Mariano Melgar',
    address: 'Calle América 512',
    displayPhone: '997 297 265',
    phone: '51997297265',
    whatsapp: true,
    maps: 'KING BRAS Pollería y Brostería Calle América 512 Mariano Melgar',
  },
  {
    id: 'cayma',
    name: 'Cayma',
    address: 'Av. Ramón Castilla 1220',
    displayPhone: '972 099 540',
    phone: '51972099540',
    whatsapp: false,
    maps: 'King Bras Av. Ramón Castilla 1220 Cayma Arequipa',
  },
]

export function buildWhatsAppLink(branch, items) {
  const included = items.filter((item) => item.available !== false)
  const lines = included.map(({ name, quantity, priceCents }) =>
    quantity + ' × ' + name + (priceCents == null ? ' (precio por confirmar)' : ' · S/ ' + (priceCents / 100).toFixed(2) + ' c/u'))
  const total = included.length && included.every((item) => item.priceCents != null)
    ? '\nImporte referencial: S/ ' + (included.reduce((sum, item) => sum + item.priceCents * item.quantity, 0) / 100).toFixed(2) + ' (sin delivery)' : ''
  const order = lines.length ? 'Quisiera pedir:\n' + lines.join('\n') + total + '\n\n' : 'Quisiera hacer un pedido. '
  const message = 'Hola, King Bras de ' + branch.name + '. ' + order +
    '¿Me confirman disponibilidad, precios y cobertura de delivery, por favor?'
  return 'https://wa.me/' + branch.phone + '?text=' + encodeURIComponent(message)
}
