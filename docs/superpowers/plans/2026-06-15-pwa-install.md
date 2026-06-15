# PWA Install-to-Home-Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow the reporter to install Paperly on Android and iOS mobile devices from the home screen as a standalone app, with a custom in-app install button.

**Architecture:** A `manifest.webmanifest` declares the app identity; an upgraded `public/sw.js` pre-caches the app shell (required for Chrome install eligibility); a `lib/pwa-prompt.ts` module stores the deferred `beforeinstallprompt` event; `RegisterServiceWorker` (client component, mounted in root layout) registers the SW and captures the event; `useInstallPrompt` hook exposes `{ canInstall, promptInstall, isIOS }` to any component; `InstallPWAButton` renders in the Sidebar.

**Tech Stack:** Next.js 16, React 19, Vitest + React Testing Library, Tailwind CSS, antd (Tooltip), lucide-react

---

## File Map

| File | Action |
|---|---|
| `public/manifest.webmanifest` | Create |
| `public/sw.js` | Upgrade (add app-shell cache + fetch handler) |
| `lib/pwa-prompt.ts` | Create — module-level store for deferred install event |
| `lib/__tests__/pwa-prompt.test.ts` | Create |
| `hooks/useInstallPrompt.ts` | Create |
| `lib/__tests__/useInstallPrompt.test.ts` | Create (test file lives in `lib/__tests__` per vitest config) |
| `components/shared/RegisterServiceWorker.tsx` | Create |
| `components/__tests__/RegisterServiceWorker.test.tsx` | Create |
| `components/shared/InstallPWAButton.tsx` | Create |
| `components/__tests__/InstallPWAButton.test.tsx` | Create |
| `app/layout.tsx` | Edit — manifest link + iOS meta tags + `<RegisterServiceWorker />` |
| `components/layout/Sidebar.tsx` | Edit — add `<InstallPWAButton>` above user footer |

---

## Task 1: Web App Manifest

**Files:**
- Create: `public/manifest.webmanifest`

- [ ] **Step 1: Create the manifest**

```json
{
  "name": "પેપરલી — સમાચાર સહાયક",
  "short_name": "Paperly",
  "description": "ગુજરાતી સમાચાર લખવા માટે AI સહાયક",
  "start_url": "/samachar",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#0f0f0f",
  "background_color": "#0f0f0f",
  "icons": [
    {
      "src": "/logo.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/logo.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

> Note: Both icon entries point to the same `logo.png`. This is acceptable for launch. Chrome only requires at least one icon ≥192×192 to show the install prompt. Generate properly sized PNGs later if needed.

- [ ] **Step 2: Commit**

```bash
git add public/manifest.webmanifest
git commit -m "feat(pwa): add web app manifest"
```

---

## Task 2: Upgrade Service Worker

**Files:**
- Modify: `public/sw.js`

- [ ] **Step 1: Read the current file**

Open `public/sw.js` and confirm it contains only the stub (install → skipWaiting, activate → clients.claim, no fetch handler).

- [ ] **Step 2: Replace the entire file**

```js
const CACHE = 'paperly-v1'
const APP_SHELL = ['/', '/samachar', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Network-first for API routes — never serve stale API responses
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => new Response('Offline', { status: 503 }))
    )
    return
  }

  // Cache-first for everything else — fast launch from home screen
  event.respondWith(
    caches.match(event.request).then((cached) => cached ?? fetch(event.request))
  )
})
```

- [ ] **Step 3: Commit**

```bash
git add public/sw.js
git commit -m "feat(pwa): upgrade service worker with app-shell caching"
```

---

## Task 3: Create pwa-prompt module

**Files:**
- Create: `lib/pwa-prompt.ts`
- Create: `lib/__tests__/pwa-prompt.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/__tests__/pwa-prompt.test.ts`:

```ts
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
```

- [ ] **Step 2: Run to confirm it fails**

```bash
bun run test lib/__tests__/pwa-prompt.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/pwa-prompt'`

- [ ] **Step 3: Create the module**

Create `lib/pwa-prompt.ts`:

```ts
export type BeforeInstallPromptEvent = Event & {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: BeforeInstallPromptEvent | null = null

export function storeInstallPrompt(e: Event): void {
  deferred = e as BeforeInstallPromptEvent
}

export function getInstallPrompt(): BeforeInstallPromptEvent | null {
  return deferred
}

export function clearInstallPrompt(): void {
  deferred = null
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
bun run test lib/__tests__/pwa-prompt.test.ts
```

Expected: PASS — 3 tests

- [ ] **Step 5: Commit**

```bash
git add lib/pwa-prompt.ts lib/__tests__/pwa-prompt.test.ts
git commit -m "feat(pwa): add pwa-prompt module for deferred install event"
```

---

## Task 4: Create useInstallPrompt hook

**Files:**
- Create: `hooks/useInstallPrompt.ts`
- Create: `lib/__tests__/useInstallPrompt.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/__tests__/useInstallPrompt.test.ts`:

```ts
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
    // No error thrown, no state change
    expect(result.current.canInstall).toBe(false)
  })
})
```

- [ ] **Step 2: Run to confirm it fails**

```bash
bun run test lib/__tests__/useInstallPrompt.test.ts
```

Expected: FAIL — `Cannot find module '@/hooks/useInstallPrompt'`

- [ ] **Step 3: Create the hook**

Create `hooks/useInstallPrompt.ts`:

```ts
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
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
bun run test lib/__tests__/useInstallPrompt.test.ts
```

Expected: PASS — 4 tests

- [ ] **Step 5: Type-check**

```bash
bun run type-check
```

Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add hooks/useInstallPrompt.ts lib/__tests__/useInstallPrompt.test.ts
git commit -m "feat(pwa): add useInstallPrompt hook"
```

---

## Task 5: Create RegisterServiceWorker component

**Files:**
- Create: `components/shared/RegisterServiceWorker.tsx`
- Create: `components/__tests__/RegisterServiceWorker.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `components/__tests__/RegisterServiceWorker.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run to confirm it fails**

```bash
bun run test components/__tests__/RegisterServiceWorker.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/shared/RegisterServiceWorker'`

- [ ] **Step 3: Create the component**

Create `components/shared/RegisterServiceWorker.tsx`:

```tsx
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
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
bun run test components/__tests__/RegisterServiceWorker.test.tsx
```

Expected: PASS — 3 tests

- [ ] **Step 5: Commit**

```bash
git add components/shared/RegisterServiceWorker.tsx components/__tests__/RegisterServiceWorker.test.tsx
git commit -m "feat(pwa): add RegisterServiceWorker client component"
```

---

## Task 6: Create InstallPWAButton component

**Files:**
- Create: `components/shared/InstallPWAButton.tsx`
- Create: `components/__tests__/InstallPWAButton.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `components/__tests__/InstallPWAButton.test.tsx`:

```tsx
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { InstallPWAButton } from '@/components/shared/InstallPWAButton'

vi.mock('@/hooks/useInstallPrompt')
import { useInstallPrompt } from '@/hooks/useInstallPrompt'

describe('InstallPWAButton', () => {
  beforeEach(() => {
    vi.mocked(useInstallPrompt).mockReturnValue({
      canInstall: false,
      promptInstall: vi.fn(),
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
      promptInstall: vi.fn(),
      isIOS: false,
    })
    render(<InstallPWAButton />)
    expect(screen.getByRole('button', { name: /install/i })).toBeInTheDocument()
  })

  it('calls promptInstall on click on Android', async () => {
    const mockPromptInstall = vi.fn().mockResolvedValue(undefined)
    vi.mocked(useInstallPrompt).mockReturnValue({
      canInstall: true,
      promptInstall: mockPromptInstall,
      isIOS: false,
    })
    render(<InstallPWAButton />)
    await userEvent.click(screen.getByRole('button', { name: /install/i }))
    expect(mockPromptInstall).toHaveBeenCalledOnce()
  })

  it('renders button when isIOS=true even if canInstall=false', () => {
    vi.mocked(useInstallPrompt).mockReturnValue({
      canInstall: false,
      promptInstall: vi.fn(),
      isIOS: true,
    })
    render(<InstallPWAButton />)
    expect(screen.getByRole('button', { name: /install/i })).toBeInTheDocument()
  })

  it('shows iOS instructions on click when isIOS=true', async () => {
    vi.mocked(useInstallPrompt).mockReturnValue({
      canInstall: false,
      promptInstall: vi.fn(),
      isIOS: true,
    })
    render(<InstallPWAButton />)
    await userEvent.click(screen.getByRole('button', { name: /install/i }))
    expect(screen.getByText(/Safari/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to confirm it fails**

```bash
bun run test components/__tests__/InstallPWAButton.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/shared/InstallPWAButton'`

- [ ] **Step 3: Create the component**

Create `components/shared/InstallPWAButton.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Tooltip } from 'antd'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { cn } from '@/lib/utils'

interface InstallPWAButtonProps {
  collapsed?: boolean
}

export function InstallPWAButton({ collapsed = false }: InstallPWAButtonProps) {
  const { canInstall, promptInstall, isIOS } = useInstallPrompt()
  const [showIOSTip, setShowIOSTip] = useState(false)

  if (!canInstall && !isIOS) return null

  async function handleClick() {
    if (isIOS) {
      setShowIOSTip((prev) => !prev)
    } else {
      await promptInstall()
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

  return (
    <div>
      {button}
      {isIOS && showIOSTip && (
        <p className="mt-1 px-3 text-[11px] leading-snug text-[#737373] dark:text-white/40">
          Safari-માં Share → &apos;Home Screen પર ઉમેરો&apos; ટૅપ કરો
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
bun run test components/__tests__/InstallPWAButton.test.tsx
```

Expected: PASS — 5 tests

- [ ] **Step 5: Type-check**

```bash
bun run type-check
```

Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add components/shared/InstallPWAButton.tsx components/__tests__/InstallPWAButton.test.tsx
git commit -m "feat(pwa): add InstallPWAButton component"
```

---

## Task 7: Update app/layout.tsx

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Read the file**

Open `app/layout.tsx` and confirm its current state (manifest link and iOS meta tags are absent, `DisableServiceWorkerInDev` is present in `<body>`).

- [ ] **Step 2: Add manifest link + iOS meta tags to `<head>`**

In `app/layout.tsx`, add these lines inside `<head>`, after the existing Google Fonts `<link>` tags:

```tsx
<link rel="manifest" href="/manifest.webmanifest" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Paperly" />
<link rel="apple-touch-icon" href="/logo.png" />
```

- [ ] **Step 3: Add `RegisterServiceWorker` to `<body>`**

Import at the top of `app/layout.tsx`:

```tsx
import { RegisterServiceWorker } from '@/components/shared/RegisterServiceWorker'
```

Add `<RegisterServiceWorker />` directly after `<DisableServiceWorkerInDev />` in `<body>`:

```tsx
<body className="font-sans antialiased" suppressHydrationWarning>
  <DisableServiceWorkerInDev />
  <RegisterServiceWorker />
  {/* ... rest of providers */}
</body>
```

- [ ] **Step 4: Type-check**

```bash
bun run type-check
```

Expected: no errors

- [ ] **Step 5: Build**

```bash
bun run build
```

Expected: build succeeds with no errors

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(pwa): add manifest link, iOS meta tags, and RegisterServiceWorker to root layout"
```

---

## Task 8: Add InstallPWAButton to Sidebar

**Files:**
- Modify: `components/layout/Sidebar.tsx`

- [ ] **Step 1: Read the file**

Open `components/layout/Sidebar.tsx` and locate the `<nav>` closing tag and the user footer `<div className="shrink-0 p-2">`.

- [ ] **Step 2: Add the import**

Add to the existing imports in `Sidebar.tsx`:

```tsx
import { InstallPWAButton } from '@/components/shared/InstallPWAButton'
```

- [ ] **Step 3: Add InstallPWAButton between nav and user footer**

In the JSX, add this block between `</nav>` and the user footer `<div className="shrink-0 p-2">`:

```tsx
{/* Install PWA — above user footer */}
<div className="shrink-0 px-2 pb-1">
  <InstallPWAButton collapsed={collapsed} />
</div>
```

The result should look like:

```tsx
      </nav>

      {/* Install PWA — above user footer */}
      <div className="shrink-0 px-2 pb-1">
        <InstallPWAButton collapsed={collapsed} />
      </div>

      {/* User footer */}
      <div className="shrink-0 p-2">
```

- [ ] **Step 4: Type-check**

```bash
bun run type-check
```

Expected: no errors

- [ ] **Step 5: Run all tests**

```bash
bun run test
```

Expected: all tests pass

- [ ] **Step 6: Build**

```bash
bun run build
```

Expected: build succeeds

- [ ] **Step 7: Commit**

```bash
git add components/layout/Sidebar.tsx
git commit -m "feat(pwa): add InstallPWAButton to sidebar"
```

---

## Verification

After all tasks are complete:

1. Deploy to a production URL (HTTPS required — install prompt never fires on `localhost`)
2. On Android Chrome: open the app, wait ~30 seconds for Chrome to show eligibility, then check the sidebar — "App ઇન્સ્ટૉલ કરો" button should appear
3. On iPhone Safari: open the app, tap the sidebar install button — Gujarati tip should appear
4. After installing on Android: launch from home screen — app should open directly to `/samachar` with no browser chrome

**If the install button doesn't appear on Android Chrome:**
- Open DevTools → Application → Manifest — confirm manifest loads and all fields are valid
- Application → Service Workers — confirm `sw.js` is registered and active
- Application → Lighthouse → run PWA audit to see which criteria are failing
