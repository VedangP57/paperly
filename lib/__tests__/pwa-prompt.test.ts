import { describe, it, expect, beforeEach } from 'vitest'
import { storeInstallPrompt, getInstallPrompt, clearInstallPrompt } from '@/lib/pwa-prompt'

describe('pwa-prompt', () => {
  beforeEach(() => clearInstallPrompt())

  it('returns null before anything is stored', () => {
    expect(getInstallPrompt()).toBeNull()
  })

  it('stores and retrieves an event', () => {
    const e = new Event('beforeinstallprompt')
    storeInstallPrompt(e)
    expect(getInstallPrompt()).toBe(e)
  })

  it('clearInstallPrompt resets to null', () => {
    storeInstallPrompt(new Event('beforeinstallprompt'))
    clearInstallPrompt()
    expect(getInstallPrompt()).toBeNull()
  })
})
