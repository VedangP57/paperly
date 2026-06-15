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
