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
        description: expect.anything(),
        duration: 8,
      })
    )
  })
})
