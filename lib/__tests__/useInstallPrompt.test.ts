import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { storeInstallPrompt, clearInstallPrompt } from '@/lib/pwa-prompt'

describe('useInstallPrompt', () => {
  beforeEach(() => {
    clearInstallPrompt()
  })

  it('canInstall is false initially', () => {
    const { result } = renderHook(() => useInstallPrompt())
    expect(result.current.canInstall).toBe(false)
  })

  it('canInstall becomes true when pwa-install-ready fires', () => {
    const { result } = renderHook(() => useInstallPrompt())
    act(() => {
      window.dispatchEvent(new Event('pwa-install-ready'))
    })
    expect(result.current.canInstall).toBe(true)
  })

  it('promptInstall calls prompt() and resets canInstall to false', async () => {
    const mockPrompt = vi.fn().mockResolvedValue(undefined)
    const mockUserChoice = Promise.resolve({ outcome: 'accepted' as const })
    storeInstallPrompt({ prompt: mockPrompt, userChoice: mockUserChoice } as unknown as Event)

    const { result } = renderHook(() => useInstallPrompt())
    act(() => {
      window.dispatchEvent(new Event('pwa-install-ready'))
    })
    expect(result.current.canInstall).toBe(true)

    await act(async () => {
      await result.current.promptInstall()
    })

    expect(mockPrompt).toHaveBeenCalledOnce()
    expect(result.current.canInstall).toBe(false)
  })

  it('promptInstall does nothing when no deferred event exists', async () => {
    const { result } = renderHook(() => useInstallPrompt())
    await act(async () => {
      await result.current.promptInstall()
    })
    expect(result.current.canInstall).toBe(false)
  })
})
