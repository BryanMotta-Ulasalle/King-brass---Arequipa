import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { build, createServer } from 'vite'
import { branches } from '../src/menu.js'

const root = fileURLToPath(new URL('../', import.meta.url))
const dist = new URL('../dist/', import.meta.url)
const indexFile = new URL('index.html', dist)
const production = process.env.CONTEXT === 'production'

function productionUrl() {
  const value = process.env.SITE_URL || process.env.URL
  const url = value ? new URL(value) : null
  if (!url || url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('La compilación de producción requiere SITE_URL o URL con el origen HTTPS público de King Bras.')
  }
  return url.href
}

function publicMetadata(url) {
  const restaurantData = {
    '@context': 'https://schema.org',
    '@graph': branches.map((branch) => ({
      '@type': 'Restaurant',
      '@id': url + '#' + branch.id,
      name: 'King Bras · ' + branch.name,
      url: url + '#' + branch.id,
      image: url + 'media/portada-brasa.webp',
      telephone: '+' + branch.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: branch.address,
        addressLocality: branch.name,
        addressRegion: 'Arequipa',
        addressCountry: 'PE',
      },
      servesCuisine: 'Peruana',
      hasMenu: url + '#carta',
    })),
  }
  const json = JSON.stringify(restaurantData).replaceAll('<', '\\u003c')

  return [
    '<link rel="canonical" href="' + url + '" />',
    '<meta property="og:type" content="website" />',
    '<meta property="og:locale" content="es_PE" />',
    '<meta property="og:title" content="King Bras Arequipa · Pollo a la brasa y broaster" />',
    '<meta property="og:description" content="Explora la carta y arma tu pedido en King Bras de Mariano Melgar o Cayma." />',
    '<meta property="og:url" content="' + url + '" />',
    '<meta property="og:image" content="' + url + 'media/portada-brasa.webp" />',
    '<meta property="og:image:alt" content="Pollo a la brasa con papas y ensalada" />',
    '<script type="application/ld+json">' + json + '</script>',
  ].join('\n    ')
}

const url = production ? productionUrl() : null
await build({ root })

// Render the same React tree used by the browser, without starting an HTTP listener.
const server = await createServer({
  root,
  appType: 'custom',
  optimizeDeps: { noDiscovery: true },
  server: { middlewareMode: true, hmr: false, watch: null },
})
let markup
try {
  const { default: App } = await server.ssrLoadModule('/src/App.jsx')
  markup = renderToString(React.createElement(App))
} finally {
  await server.close()
}

const preloads = markup.match(/^(?:<link rel="preload"[^>]*>)+/)?.[0] ?? ''
const body = markup.slice(preloads.length)
const template = await readFile(indexFile, 'utf8')
const robotsMeta = '<meta name="robots" content="noindex" />'
const rootPlaceholder = '<div id="root"></div>'
if (!template.includes(robotsMeta) || !template.includes(rootPlaceholder)) {
  throw new Error('Falta el contenedor de React o la etiqueta de indexación en index.html.')
}

const html = template
  .replace(rootPlaceholder, () => '<div id="root">' + body + '</div>')
  .replace('</head>', () => preloads + '\n  </head>')
  .replace(robotsMeta, () => url ? publicMetadata(url) : robotsMeta)

const robots = 'User-agent: *\nAllow: /\n' + (url ? '\nSitemap: ' + url + 'sitemap.xml\n' : '')
const output = [
  writeFile(indexFile, html),
  writeFile(new URL('robots.txt', dist), robots),
]
if (url) {
  output.push(writeFile(new URL('sitemap.xml', dist),
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    '  <url><loc>' + url + '</loc></url>\n' +
    '</urlset>\n'))
} else {
  output.push(writeFile(new URL('_headers', dist), '/*\n  X-Robots-Tag: noindex\n'))
}
await Promise.all(output)
console.log(url ? 'Producción indexable: ' + url : 'Vista previa con noindex.')
