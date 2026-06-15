'use client'

import { useEffect } from 'react'
import { storeInstallPrompt } from '@/lib/pwa-prompt'

export function RegisterServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW registration failure is non-fatal
    })

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      storeInstallPrompt(e)
      window.dispatchEvent(new Event('pwa-install-ready'))
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  }, [])

  return null
}
