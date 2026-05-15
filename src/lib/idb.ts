/**
 * AutoSound Pro - IndexedDB Storage Engine
 * Usado pelo Zustand Persist Middleware para salvar estados pesados
 * sem bloquear a UI Thread (Non-Blocking Storage).
 */

const DB_NAME = 'AutoSoundProDB'
const STORE_NAME = 'zustand-persist'

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    // Trata SSR (Server-Side Rendering) e ambientes sem window
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('indexedDB not available'))
    }

    const request = indexedDB.open(DB_NAME, 1)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const idbStorage = {
  async getItem(name: string): Promise<string | null> {
    try {
      const db = await getDB()
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)
        const request = store.get(name)

        request.onsuccess = () => resolve(request.result || null)
        request.onerror = () => resolve(null) // Falha silenciosa em caso de corrupção
      })
    } catch (e) {
      console.warn('[IDB] Get falhou, caindo para null', e)
      return null
    }
  },

  async setItem(name: string, value: string): Promise<void> {
    try {
      const db = await getDB()
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        store.put(value, name)

        tx.oncomplete = () => resolve()
        tx.onerror = () => resolve()
      })
    } catch (e) {
      console.warn('[IDB] Set falhou', e)
    }
  },

  async removeItem(name: string): Promise<void> {
    try {
      const db = await getDB()
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        store.delete(name)

        tx.oncomplete = () => resolve()
        tx.onerror = () => resolve()
      })
    } catch (e) {
      console.warn('[IDB] Remove falhou', e)
    }
  }
}
