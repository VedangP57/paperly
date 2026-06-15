# PWA — Install to Home Screen
**Date:** 2026-06-15
**Status:** Approved

## Goal

Allow the Gujarat Samachar reporter to install Paperly on their Android or iOS mobile device and launch it from the home screen as a standalone app (no browser chrome). No offline writing required.

## Approach

Option A — manifest + minimal service worker + install hook. Zero new npm dependencies.

## Files

| File | Action | Purpose |
|---|---|---|
| `public/manifest.webmanifest` | Create | App identity, icons, display mode, start URL |
| `public/sw.js` | Upgrade | App-shell caching to satisfy Chrome install criteria |
| `components/shared/RegisterServiceWorker.tsx` | Create | Null-rendering client component; registers SW + captures `beforeinstallprompt` |
| `hooks/useInstallPrompt.ts` | Create | Exposes `{ canInstall, promptInstall, isIOS }` |
| `components/shared/InstallPWAButton.tsx` | Create | Install button with Android prompt + iOS tooltip |
| `app/layout.tsx` | Edit | Add manifest link + iOS meta tags |
| `components/layout/Sidebar.tsx` | Edit | Render `<InstallPWAButton>` at sidebar bottom |

## Manifest

```json
{
  "name": "પેપરલી — સમાચાર સહાયક",
  "short_name": "Paperly",
  "start_url": "/samachar",
  "display": "standalone",
  "theme_color": "#0f0f0f",
  "background_color": "#0f0f0f",
  "icons": [
    { "src": "/logo.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/logo.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

> Note: Ideally generate proper 192×192 and 512×512 PNGs from `logo.png`. Using the same file for both is acceptable for launch; Chrome accepts it.

## Service Worker (`public/sw.js`)

- **Install event:** pre-cache `/`, `/samachar`, and `/manifest.webmanifest`
- **Fetch — API routes (`/api/*`):** network-first, no caching
- **Fetch — everything else:** cache-first (serve from cache, fall back to network)
- Keeps `skipWaiting()` + `clients.claim()` for immediate activation on update
- No background sync, no push notifications, no IndexedDB

## Install Prompt

**`hooks/useInstallPrompt.ts`**
- Listens for `beforeinstallprompt`, stashes the deferred event
- Returns `{ canInstall: boolean, promptInstall: () => void, isIOS: boolean }`
- `isIOS` detected via `navigator.userAgent` (`/iphone|ipad|ipod/i`)
- Calls `deferredPrompt.prompt()` in `promptInstall()`, then clears state

**`components/shared/RegisterServiceWorker.tsx`**
- `'use client'` null-rendering component mounted in root `layout.tsx`
- Registers `/sw.js` on `window.load`
- Fires `beforeinstallprompt` listener and stores event in a module-level ref so `useInstallPrompt` can read it across renders

**`components/shared/InstallPWAButton.tsx`**
- Hides itself if `!canInstall && !isIOS`
- Android: button → calls `promptInstall()` → Chrome shows native install dialog
- iOS: button → shows tooltip in Gujarati: *"Safari-માં Share → 'Home Screen પર ઉમેરો' ટૅપ કરો"*
- Styled to match existing sidebar nav items (icon + label pattern)

## Layout Changes (`app/layout.tsx`)

Add inside `<head>`:
```html
<link rel="manifest" href="/manifest.webmanifest" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Paperly" />
<link rel="apple-touch-icon" href="/logo.png" />
```

Add `<RegisterServiceWorker />` inside `<body>` (alongside existing `<DisableServiceWorkerInDev />`).

## Sidebar Integration

`<InstallPWAButton>` placed at the bottom of the nav list in `Sidebar.tsx`, above the user/sign-out section. Uses the same icon + text pattern as existing sidebar items. Only visible when install is available or on iOS.

## Out of Scope

- Offline article writing / sync
- Push notifications
- Background fetch
- Desktop (Chrome/Edge) install
- Generating properly-sized icon PNGs (acceptable to reuse `logo.png` at launch)
