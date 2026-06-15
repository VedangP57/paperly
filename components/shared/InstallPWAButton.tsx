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
