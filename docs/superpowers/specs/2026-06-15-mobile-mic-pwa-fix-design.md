# Mobile Mic + PWA Install Button Fix
**Date:** 2026-06-15
**Status:** Approved

## Problem

On iPhone Chrome:
1. **Mic button** — tapping it does nothing. `rec.start()` fires `onerror` immediately (`service-not-allowed`) and the handler silently calls `setListening(false)`. No permission dialog, no error feedback.
2. **Install button** — tapping it does nothing. The antd `Popover` breaks inside the mobile Sheet drawer (z-index / tap event eaten by Sheet's outside-click handler).

## Fix 1: Mic — Pre-flight getUserMedia + Rich Error Handling

**File:** `components/samachar/useVoiceInput.ts`

### Pre-flight mic permission
Before calling `rec.start()`, call `navigator.mediaDevices.getUserMedia({ audio: true })`. This is what actually triggers the mic permission dialog on mobile browsers. Once the user grants permission:
- Stop and release the MediaStream (we only needed it to trigger the dialog)
- Call `rec.start()` to begin speech recognition

If `getUserMedia` itself is rejected (permission denied before even trying), catch the error and show a notification immediately — no need to attempt `rec.start()`.

### Rich onerror handler
Replace `rec.onerror = () => setListening(false)` with a handler that reads `event.error` and calls `showMicError(event.error)`:

| `event.error` | Notification message |
|---|---|
| `service-not-allowed` | "Voice input only works in Safari on iPhone. Please open Paperly in Safari." |
| `not-allowed` | "Microphone access denied. Go to Settings → Chrome → Microphone and allow access." |
| `network` | "Network error during voice input. Please check your connection and try again." |
| anything else | "Voice input error. Please try again." |

Notifications use antd `notification.warning` with `title` (Gujarati label) and `description` (instruction).

### No change to `supported` detection or button visibility
The `VoiceButton` continues to show whenever `supported = true`. The error handling is the new layer.

## Fix 2: Install Button — Replace Popover with antd notification

**File:** `components/shared/InstallPWAButton.tsx`

Remove the antd `Popover` and `showIOSTip` state entirely. On iOS button tap, call `notification.open()` instead. The notification renders above the Sheet in a fixed overlay — no positioning issues.

Notification content (same 3 steps, now as a notification card):
- **Title:** "App ઇન્સ્ટૉલ કરો"
- **Description:** Step-by-step in Gujarati: Safari ખોલો → Share → Home Screen પર ઉમેરો → ઉમેરો
- **Duration:** 8 seconds (long enough to read and act)

The `IOSInstructions` component and `Popover` import are removed. `Share` icon import from lucide removed. `popoverOpen` state removed.

## Files Changed

| File | Change |
|---|---|
| `components/samachar/useVoiceInput.ts` | Add `getUserMedia` pre-flight, rich `onerror` with antd notification |
| `components/shared/InstallPWAButton.tsx` | Replace Popover with `notification.open()` for iOS |

## Out of Scope

- Making voice input work in Chrome on iOS (Apple blocks it — not fixable)
- Offline voice recognition
- Alternative STT providers (Whisper, Google) as fallback
