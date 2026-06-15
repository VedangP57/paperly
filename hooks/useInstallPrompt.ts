'use client'

import { useEffect, useState } from 'react'
import { getInstallPrompt, clearInstallPrompt } from '@/lib/pwa-prompt'

export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent))

    const onReady = () => setCanInstall(true)
    window.addEventListener('pwa-install-ready', onReady)
    return () => window.removeEventListener('pwa-install-ready', onReady)
  }, [])

  async function promptInstall() {
    const prompt = getInstallPrompt()
    if (!prompt) return
    await prompt.prompt()
    await prompt.userChoice
    clearInstallPrompt()
    setCanInstall(false)
  }

  return { canInstall, promptInstall, isIOS }
}
