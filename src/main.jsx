import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource/barlow-condensed/latin-800.css'
import '@fontsource-variable/dm-sans'
import App from './App'
import './styles.css'

const root = document.getElementById('root')
const app = <App />

if (root.hasChildNodes()) {
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}
