# Mobile Mic + PWA Install Button Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix mic button silently failing on iPhone Chrome (no permission dialog, no error feedback) and PWA install button doing nothing on iOS (antd Popover swallowed by Sheet drawer).

**Architecture:** Two isolated file changes. `useVoiceInput.ts` adds a `getUserMedia` preflight before `rec.start()` to trigger the native mic permission dialog on mobile, and replaces the silent `onerror = () => setListening(false)` with a rich antd `notification.warning` per error code. `InstallPWAButton.tsx` removes the `Popover` + `IOSInstructions` pattern entirely and calls `notification.open()` on iOS tap — antd notification renders in a fixed portal above the Sheet, so it is immune to the Sheet's outside-click handler.

**Tech Stack:** React 19, antd v6 (`App.useApp`, `notification`), Web Speech API, `navigator.mediaDevices.getUserMedia`, Vitest, React Testing Library (`renderHook`, `userEvent`)

---

### Task 1: Update useVoiceInput — getUserMedia preflight + rich onerror

**Files:**
- Modify: `components/samachar/useVoiceInput.ts`
- Create: `components/__tests__/useVoiceInput.test.tsx`

Context: The hook currently calls `rec.start()` directly. On Chrome iOS this fires `onerror` with `service-not-allowed` immediately (Apple blocks Web Speech API in Chrome). On Android Chrome the mic permission dialog never appears because `getUserMedia` is what triggers it, not the speech API. The fix: call `getUserMedia` first to trigger the dialog, then start recognition only if it succeeds.

The hook now calls `App.useApp()` from antd to get `notification`. This means any component that uses `useVoiceInput` must be inside antd's `<App>` context. The app already has this wrapper (SamacharTool uses antd notifications).

---

- [ ] **Step 1: Write the failing tests**

Create `components/__tests__/useVoiceInput.test.tsx`:

```tsx
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
    value: vi.fn(() => mockRec),
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/sarvadhisolution/Documents/Personal/paperly
bun run vitest run components/__tests__/useVoiceInput.test.tsx
```

Expected: Tests fail with errors like "notification.warning is not a function" or "Cannot read properties of undefined (reading 'getUserMedia')" — the hook doesn't have `getUserMedia` or the notification calls yet.

- [ ] **Step 3: Implement the changes**

Replace the full content of `components/samachar/useVoiceInput.ts`:

```ts
'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { App } from 'antd'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySpeechRecognition = any

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition?: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition?: any
  }
}

function getMicErrorArgs(errorCode: string): { title: string; description: string } {
  switch (errorCode) {
    case 'service-not-allowed':
      return {
        title: 'Voice input not supported',
        description: 'Voice input only works in Safari on iPhone. Please open Paperly in Safari.',
      }
    case 'not-allowed':
      return {
        title: 'Microphone access denied',
        description: 'Go to Settings → Chrome → Microphone and allow access.',
      }
    case 'network':
      return {
        title: 'Network error',
        description: 'Network error during voice input. Please check your connection and try again.',
      }
    default:
      return {
        title: 'Voice input error',
        description: 'Please try again.',
      }
  }
}

export function useVoiceInput(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef<AnySpeechRecognition>(null)
  const { notification } = App.useApp()

  useEffect(() => {
    setSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  }, [])

  const startListening = useCallback(async () => {
    if (!supported) return
    const Ctor = window.webkitSpeechRecognition ?? window.SpeechRecognition
    if (!Ctor) return

    // getUserMedia triggers the native mic permission dialog on mobile browsers
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
    } catch (err: unknown) {
      const code =
        (err as { name?: string })?.name === 'NotAllowedError'
          ? 'not-allowed'
          : 'service-not-allowed'
      notification.warning(getMicErrorArgs(code))
      return
    }

    const rec = new Ctor()
    rec.lang = 'gu-IN'
    rec.continuous = false
    rec.interimResults = false

    rec.onstart = () => setListening(true)
    rec.onend = () => setListening(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (event: any) => {
      setListening(false)
      notification.warning(getMicErrorArgs(event.error ?? ''))
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (event: any) => {
      const transcript: string = event.results[0]?.[0]?.transcript ?? ''
      if (transcript) onResult(transcript)
    }

    recognitionRef.current = rec
    rec.start()
  }, [supported, onResult, notification])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  return { listening, supported, startListening, stopListening }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
bun run vitest run components/__tests__/useVoiceInput.test.tsx
```

Expected: All 8 tests pass.

- [ ] **Step 5: Commit**

```bash
git add components/samachar/useVoiceInput.ts components/__tests__/useVoiceInput.test.tsx
git commit -m "fix(mic): getUserMedia preflight + rich onerror notifications on mobile"
```

---

### Task 2: Update InstallPWAButton — replace Popover with notification.open()

**Files:**
- Modify: `components/shared/InstallPWAButton.tsx`
- Modify: `components/__tests__/InstallPWAButton.test.tsx`

Context: The antd `Popover` fails silently on mobile when rendered inside a `SheetContent` — the Sheet's `onPointerDownOutside` handler intercepts the tap before the Popover opens. `notification.open()` renders into a fixed antd portal at the document root, bypassing any Sheet z-index or event handler entirely.

Removals: `IOSInstructions` component, `popoverOpen` state, `Share` icon import, `Popover` import. The `Tooltip` (used for collapsed state) is kept.

---

- [ ] **Step 1: Update the existing tests**

The current test at line 55–64 checks for "Safari" text in the DOM (Popover content). With the new approach, `notification.open()` renders into a portal outside the component — the text won't be in the DOM tree. Replace that test with an assertion that `notification.open` was called with the correct args.

Replace the full content of `components/__tests__/InstallPWAButton.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  notificationOpen: vi.fn(),
  promptInstall: vi.fn(),
}))

vi.mock('@/hooks/useInstallPrompt', () => ({
  useInstallPrompt: vi.fn(),
}))

vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd')
  return {
    ...actual,
    App: {
      ...actual.App,
      useApp: () => ({ notification: { open: mocks.notificationOpen } }),
    },
  }
})

import { InstallPWAButton } from '@/components/shared/InstallPWAButton'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'

describe('InstallPWAButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useInstallPrompt).mockReturnValue({
      canInstall: false,
      promptInstall: mocks.promptInstall,
      isIOS: false,
    })
  })

  it('renders nothing when canInstall=false and isIOS=false', () => {
    const { container } = render(<InstallPWAButton />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders button when canInstall=true', () => {
    vi.mocked(useInstallPrompt).mockReturnValue({
      canInstall: true,
      promptInstall: mocks.promptInstall,
      isIOS: false,
    })
    render(<InstallPWAButton />)
    expect(screen.getByRole('button', { name: /install/i })).toBeInTheDocument()
  })

  it('calls promptInstall on click on Android', async () => {
    vi.mocked(useInstallPrompt).mockReturnValue({
      canInstall: true,
      promptInstall: mocks.promptInstall,
      isIOS: false,
    })
    render(<InstallPWAButton />)
    await userEvent.click(screen.getByRole('button', { name: /install/i }))
    expect(mocks.promptInstall).toHaveBeenCalledOnce()
  })

  it('renders button when isIOS=true even if canInstall=false', () => {
    vi.mocked(useInstallPrompt).mockReturnValue({
      canInstall: false,
      promptInstall: mocks.promptInstall,
      isIOS: true,
    })
    render(<InstallPWAButton />)
    expect(screen.getByRole('button', { name: /install/i })).toBeInTheDocument()
  })

  it('calls notification.open with iOS install instructions on click when isIOS=true', async () => {
    vi.mocked(useInstallPrompt).mockReturnValue({
      canInstall: false,
      promptInstall: mocks.promptInstall,
      isIOS: true,
    })
    render(<InstallPWAButton />)
    await userEvent.click(screen.getByRole('button', { name: /install/i }))
    expect(mocks.notificationOpen).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'App ઇન્સ્ટૉલ કરો',
        duration: 8,
      })
    )
  })
})
```

- [ ] **Step 2: Run tests to verify the iOS notification test fails**

```bash
bun run vitest run components/__tests__/InstallPWAButton.test.tsx
```

Expected: Test 5 ("calls notification.open...") fails because the current component calls `setPopoverOpen` not `notification.open`. Other tests may pass or fail depending on Popover rendering.

- [ ] **Step 3: Implement the changes**

Replace the full content of `components/shared/InstallPWAButton.tsx`:

```tsx
'use client'

import { App, Tooltip } from 'antd'
import { Download } from 'lucide-react'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { cn } from '@/lib/utils'

interface InstallPWAButtonProps {
  collapsed?: boolean
}

export function InstallPWAButton({ collapsed = false }: InstallPWAButtonProps) {
  const { canInstall, promptInstall, isIOS } = useInstallPrompt()
  const { notification } = App.useApp()

  if (!canInstall && !isIOS) return null

  function handleClick() {
    if (isIOS) {
      notification.open({
        title: 'App ઇન્સ્ટૉલ કરો',
        description: (
          <ol style={{ margin: 0, paddingLeft: '1.1rem', lineHeight: 1.8 }}>
            <li>Safari ખોલો</li>
            <li>Share → <strong>Home Screen પર ઉમેરો</strong> ટૅપ કરો</li>
            <li>ઉપર જમણી બાજુ <strong>ઉમેરો</strong> ટૅપ કરો</li>
          </ol>
        ),
        duration: 8,
      })
    } else {
      promptInstall()
    }
  }

  const button = (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Install Paperly app"
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-lg py-2 text-[13px] font-normal transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#5e5cc5]/30 hover:bg-[#f5f5f5] dark:hover:bg-white/[0.04]',
        collapsed ? 'justify-center px-2.5' : 'px-3'
      )}
    >
      <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center text-[#737373] group-hover:text-[#404040] dark:text-white/50 dark:group-hover:text-white/80">
        <Download className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </span>
      {!collapsed && (
        <span className="truncate text-[#404040] dark:text-white/70">App ઇન્સ્ટૉલ કરો</span>
      )}
    </button>
  )

  if (collapsed) {
    return (
      <Tooltip title="App ઇન્સ્ટૉલ કરો" placement="right">
        {button}
      </Tooltip>
    )
  }

  return button
}
```

- [ ] **Step 4: Run the InstallPWAButton tests**

```bash
bun run vitest run components/__tests__/InstallPWAButton.test.tsx
```

Expected: All 5 tests pass.

- [ ] **Step 5: Run the full test suite**

```bash
bun run vitest run
```

Expected: All tests pass. Count will be previous total + 8 new tests from Task 1.

- [ ] **Step 6: Commit**

```bash
git add components/shared/InstallPWAButton.tsx components/__tests__/InstallPWAButton.test.tsx
git commit -m "fix(pwa): replace Popover with notification.open() for iOS — immune to Sheet overlay"
```

---

## Self-Review

**Spec coverage:**
- Fix 1 — getUserMedia preflight before `rec.start()`: ✅ Task 1 step 3, `startListening` calls `getUserMedia` first
- Fix 1 — stops MediaStream tracks: ✅ `stream.getTracks().forEach((track) => track.stop())`
- Fix 1 — `service-not-allowed` message: ✅ `getMicErrorArgs('service-not-allowed')` → "Voice input only works in Safari on iPhone"
- Fix 1 — `not-allowed` message: ✅ `getMicErrorArgs('not-allowed')` → "Microphone access denied"
- Fix 1 — `network` message: ✅ `getMicErrorArgs('network')` → "Network error during voice input"
- Fix 1 — generic fallback: ✅ `default` case → "Voice input error. Please try again."
- Fix 1 — no change to `supported` detection or button visibility: ✅ `supported` state and `useEffect` untouched
- Fix 2 — Remove Popover: ✅ Not present in Task 2 implementation
- Fix 2 — Remove IOSInstructions component: ✅ Not present in Task 2 implementation
- Fix 2 — Remove `Share` icon, `popoverOpen` state: ✅ Not present in Task 2 implementation
- Fix 2 — `notification.open({ title: 'App ઇન્સ્ટૉલ કરો', duration: 8 })`: ✅ Task 2 step 3
- Fix 2 — 3-step Gujarati instructions: ✅ ol with 3 li elements in description
- Out of scope (Chrome iOS voice, Whisper, offline): ✅ Not added

**Placeholder scan:** None found.

**Type consistency:**
- `getMicErrorArgs` returns `{ title: string; description: string }` — passed to `notification.warning()` in both getUserMedia catch and rec.onerror ✅
- `useVoiceInput` return type: `{ listening, supported, startListening, stopListening }` — unchanged ✅
- `InstallPWAButton` props: `{ collapsed?: boolean }` — unchanged ✅
- `notification.open({ title, description, duration })` in implementation matches test assertion `expect.objectContaining({ title: '...', duration: 8 })` ✅
