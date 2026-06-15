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
