'use client'

import { useEffect } from 'react'

export function RegisterSW() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // Em desenvolvimento o service worker cacheia chunks desatualizados e
    // quebra o HMR (erros como "[object Event]"). Aqui ele é removido,
    // servindo como auto-recuperação para quem já o tinha registrado.
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker
        .getRegistrations()
        .then((registros) => registros.forEach((registro) => registro.unregister()))
        .catch(() => {})
      if ('caches' in window) {
        caches
          .keys()
          .then((nomes) => nomes.forEach((nome) => caches.delete(nome)))
          .catch(() => {})
      }
      return
    }

    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Registro falhou silenciosamente; o app continua funcionando sem offline.
      })
    }
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  return null
}
