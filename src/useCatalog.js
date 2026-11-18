import { useEffect, useSyncExternalStore } from 'react'
import { createCatalogStore } from './catalog.js'
import { catalogConfig } from './catalog-config.js'

const store = createCatalogStore()

export function useCatalog() {
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)
  useEffect(() => {
    const update = () => { if (document.visibilityState === 'visible') void store.refresh() }
    store.initialize()
    update()
    const timer = setInterval(update, Math.min(60000, catalogConfig.refreshMs))
    document.addEventListener('visibilitychange', update)
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', update) }
  }, [])
  return snapshot
}
