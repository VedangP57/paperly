import { render, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RegisterServiceWorker } from '@/components/shared/RegisterServiceWorker'
import { getInstallPrompt, clearInstallPrompt } from '@/lib/pwa-prompt'

const mockRegister = vi.fn().mockResolvedValue(undefined)

beforeEach(() => {
  clearInstallPrompt()
  Object.defineProperty(navigator, 'serviceWorker', {
    value: { register: mockRegister },
    writable: true,
    configurable: true,
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('RegisterServiceWorker', () => {
  it('renders nothing (null)', () => {
    const { container } = render(<RegisterServiceWorker />)
    expect(container).toBeEmptyDOMElement()
  })

  it('registers /sw.js after mount', async () => {
    await act(async () => {
      render(<RegisterServiceWorker />)
    })
    expect(mockRegister).toHaveBeenCalledWith('/sw.js')
  })

  it('stores the deferred prompt and dispatches pwa-install-ready on beforeinstallprompt', async () => {
    const listener = vi.fn()
    window.addEventListener('pwa-install-ready', listener)

    await act(async () => {
      render(<RegisterServiceWorker />)
    })

    const e = new Event('beforeinstallprompt')
    act(() => {
      window.dispatchEvent(e)
    })

    expect(listener).toHaveBeenCalledOnce()
    expect(getInstallPrompt()).toBe(e)
    window.removeEventListener('pwa-install-ready', listener)
  })
})
