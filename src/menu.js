export const categories = [
  { id: 'destacados', label: 'Destacados' },
  { id: 'brasa', label: 'A la brasa' },
  { id: 'broaster', label: 'Broaster' },
  { id: 'conos', label: 'Conos' },
  { id: 'combos', label: 'Combos y chaufa' },
  { id: 'bebidas', label: 'Bebidas' },
]

export const menu = [
  { id: 'brasa-entero', category: 'brasa', name: 'Pollo a la brasa entero', note: 'La opción para compartir.', image: 'brasa', featured: true },
  { id: 'brasa-cuarto', category: 'brasa', name: '¼ de pollo a la brasa', note: 'Porción individual con papas.', image: 'brasa-cuarto' },
  { id: 'brasa-medio', category: 'brasa', name: '½ pollo a la brasa', note: 'Medio pollo dorado a la brasa.', image: 'brasa-media' },
  { id: 'brasa-entero-cuarto', category: 'brasa', name: 'Pollo a la brasa entero + ¼ de pierna', note: 'Con papas, ensalada, salsas y agua.' },
  { id: 'broaster-medio', category: 'broaster', name: '½ pollo broaster', note: 'Pollo apanado, dorado y crujiente.', image: 'broaster', featured: true },
  { id: 'broaster-pierna', category: 'broaster', name: '¼ de broaster · Pierna', note: 'Una porción de pierna apanada.', image: 'broaster-pierna' },
  { id: 'broaster-pecho', category: 'broaster', name: '¼ de broaster · Pechuga', note: 'Una porción de pechuga apanada.', image: 'broaster-cuarto' },
  { id: 'broaster-entero', category: 'broaster', name: 'Pollo broaster entero', note: 'Piezas crujientes para compartir.', image: 'broaster-entero' },
  { id: 'broaster-entero-cuarto', category: 'broaster', name: 'Broaster entero + ¼ de pierna', note: 'Con papas, ensalada y salsas.' },
  { id: 'conazo', category: 'conos', name: 'King Conazo broaster', note: '⅛ de broaster, salchicha, papas, salsas y maracuyá.', image: 'conazo-galeria', featured: true },
  { id: 'cono-salchicha', category: 'conos', name: 'King Cono salchicha', note: 'Salchicha, papas, salsas y maracuyá.' },
  { id: 'combo-brasa', category: 'combos', name: 'Pollo entero a la brasa + chaufa', note: 'Un pollo entero y arroz chaufa para compartir.' },
  { id: 'combo-broaster', category: 'combos', name: 'Broaster entero + chaufa', note: 'Pollo broaster entero y arroz chaufa.' },
  { id: 'mostrito-brasa', category: 'combos', name: 'Mostrito de brasa', note: 'Con ¼ de pollo a la brasa.' },
  { id: 'mostrito-broaster-pecho', category: 'combos', name: 'Mostrito de broaster · Pechuga', note: 'Con ¼ de pechuga broaster.', image: 'mostrito' },
  { id: 'mostrito-broaster-pierna', category: 'combos', name: 'Mostrito de broaster · Pierna', note: 'Con ¼ de pierna broaster.' },
  { id: 'chaufa-entero', category: 'combos', name: 'Porción de chaufa', note: 'Arroz chaufa con pollo.', image: 'chaufa' },
  { id: 'chaufa-media', category: 'combos', name: '½ porción de chaufa', note: 'Media porción de arroz chaufa.' },
  { id: 'gaseosa-250', category: 'bebidas', name: 'Gaseosa · 250 ml' },
  { id: 'gaseosa-600', category: 'bebidas', name: 'Gaseosa · 600 ml' },
  { id: 'gaseosa-2250', category: 'bebidas', name: 'Gaseosa · 2,25 L' },
  { id: 'gaseosa-3000', category: 'bebidas', name: 'Gaseosa · 3 L' },
  { id: 'chicha-media', category: 'bebidas', name: 'Chicha · ½ L' },
  { id: 'chicha-entera', category: 'bebidas', name: 'Chicha · 1 L' },
  { id: 'maracuya-media', category: 'bebidas', name: 'Maracuyá · ½ L' },
  { id: 'maracuya-entera', category: 'bebidas', name: 'Maracuyá · 1 L' },
]

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
  const lines = items.map(({ name, quantity }) => quantity + ' × ' + name)
  const order = lines.length ? 'Quisiera pedir:\n' + lines.join('\n') + '\n\n' : 'Quisiera hacer un pedido. '
  const message = 'Hola, King Bras de ' + branch.name + '. ' + order +
    '¿Me confirman disponibilidad, precios y cobertura de delivery, por favor?'
  return 'https://wa.me/' + branch.phone + '?text=' + encodeURIComponent(message)
}
