import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  notificationWarning: vi.fn(),
}))

vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd')
  return {
    ...actual,
    App: {
      ...actual.App,
      useApp: () => ({ notification: { warning: mocks.notificationWarning } }),
    },
  }
})

import { useVoiceInput } from '@/components/samachar/useVoiceInput'

function makeMockRec() {
  return {
    start: vi.fn(),
    stop: vi.fn(),
    lang: '' as string,
    continuous: false,
    interimResults: false,
    onstart: null as ((e: Event) => void) | null,
    onend: null as ((e: Event) => void) | null,
    onerror: null as ((e: { error: string }) => void) | null,
    onresult: null as ((e: { results: { 0: { transcript: string } }[] }) => void) | null,
  }
}

function setupSpeech() {
  const mockRec = makeMockRec()
  Object.defineProperty(window, 'webkitSpeechRecognition', {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: vi.fn(function () { return mockRec as any }),
    writable: true,
    configurable: true,
  })
  return mockRec
}

function setupGetUserMedia(outcome: 'ok' | 'NotAllowedError' | 'other' = 'ok') {
  const stream = { getTracks: () => [{ stop: vi.fn() }] }
  const fn =
    outcome === 'ok'
      ? vi.fn().mockResolvedValue(stream)
      : outcome === 'NotAllowedError'
      ? vi.fn().mockRejectedValue(Object.assign(new Error('denied'), { name: 'NotAllowedError' }))
      : vi.fn().mockRejectedValue(new Error('unknown'))

  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia: fn },
    writable: true,
    configurable: true,
  })
  return fn
}

describe('useVoiceInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('supported is true when webkitSpeechRecognition is in window', async () => {
    setupSpeech()
    setupGetUserMedia()
    const { result } = renderHook(() => useVoiceInput(vi.fn()))
    await act(async () => {})
    expect(result.current.supported).toBe(true)
  })

  it('calls getUserMedia({ audio: true }) before starting recognition', async () => {
    const mockRec = setupSpeech()
    const getUserMedia = setupGetUserMedia()
    const { result } = renderHook(() => useVoiceInput(vi.fn()))
    await act(async () => {})
    await act(async () => { await result.current.startListening() })
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true })
    expect(mockRec.start).toHaveBeenCalled()
  })

  it('stops all MediaStream tracks after getUserMedia resolves', async () => {
    const stopTrack = vi.fn()
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] }) },
      writable: true,
      configurable: true,
    })
    const mockRec = setupSpeech()
    const { result } = renderHook(() => useVoiceInput(vi.fn()))
    await act(async () => {})
    await act(async () => { await result.current.startListening() })
    expect(stopTrack).toHaveBeenCalled()
    expect(mockRec.start).toHaveBeenCalled()
  })

  it('skips rec.start and shows not-allowed notification on NotAllowedError', async () => {
    const mockRec = setupSpeech()
    setupGetUserMedia('NotAllowedError')
    const { result } = renderHook(() => useVoiceInput(vi.fn()))
    await act(async () => {})
    await act(async () => { await result.current.startListening() })
    expect(mockRec.start).not.toHaveBeenCalled()
    expect(mocks.notificationWarning).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Microphone access denied' })
    )
  })

  it('skips rec.start and shows service-not-allowed notification on unknown getUserMedia error', async () => {
    const mockRec = setupSpeech()
    setupGetUserMedia('other')
    const { result } = renderHook(() => useVoiceInput(vi.fn()))
    await act(async () => {})
    await act(async () => { await result.current.startListening() })
    expect(mockRec.start).not.toHaveBeenCalled()
    expect(mocks.notificationWarning).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Voice input not supported' })
    )
  })

  it('shows service-not-allowed notification when rec.onerror fires', async () => {
    const mockRec = setupSpeech()
    setupGetUserMedia()
    const { result } = renderHook(() => useVoiceInput(vi.fn()))
    await act(async () => {})
    await act(async () => { await result.current.startListening() })
    act(() => { mockRec.onerror?.({ error: 'service-not-allowed' }) })
    expect(mocks.notificationWarning).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Voice input not supported' })
    )
  })

  it('shows network notification when rec.onerror fires with network', async () => {
    const mockRec = setupSpeech()
    setupGetUserMedia()
    const { result } = renderHook(() => useVoiceInput(vi.fn()))
    await act(async () => {})
    await act(async () => { await result.current.startListening() })
    act(() => { mockRec.onerror?.({ error: 'network' }) })
    expect(mocks.notificationWarning).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Network error' })
    )
  })

  it('calls onResult with transcript when recognition succeeds', async () => {
    const mockRec = setupSpeech()
    setupGetUserMedia()
    const onResult = vi.fn()
    const { result } = renderHook(() => useVoiceInput(onResult))
    await act(async () => {})
    await act(async () => { await result.current.startListening() })
    act(() => { mockRec.onresult?.({ results: [[{ transcript: 'test text' }]] }) })
    expect(onResult).toHaveBeenCalledWith('test text')
  })
})
