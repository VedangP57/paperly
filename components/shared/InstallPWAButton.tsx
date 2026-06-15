'use client'

import { useState } from 'react'
import { Download, Share } from 'lucide-react'
import { Popover, Tooltip } from 'antd'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { cn } from '@/lib/utils'

interface InstallPWAButtonProps {
  collapsed?: boolean
}

function IOSInstructions() {
  return (
    <div className="flex flex-col gap-2 py-1 max-w-[220px]">
      <p className="text-[13px] font-semibold text-[#18181b] dark:text-white">
        Home Screen પર ઉમેરો
      </p>
      <ol className="flex flex-col gap-1.5 text-[12px] text-[#404040] dark:text-white/80 list-none m-0 p-0">
        <li className="flex items-start gap-1.5">
          <span className="shrink-0 mt-0.5 text-[#5e5cc5]">1.</span>
          <span>Safari-નું <Share className="inline h-3.5 w-3.5 mb-0.5" /> Share બટન ટૅપ કરો</span>
        </li>
        <li className="flex items-start gap-1.5">
          <span className="shrink-0 mt-0.5 text-[#5e5cc5]">2.</span>
          <span><strong>&ldquo;Home Screen પર ઉમેરો&rdquo;</strong> ટૅપ કરો</span>
        </li>
        <li className="flex items-start gap-1.5">
          <span className="shrink-0 mt-0.5 text-[#5e5cc5]">3.</span>
          <span>ઉપર જમણી બાજુ <strong>ઉમેરો</strong> ટૅપ કરો</span>
        </li>
      </ol>
      <p className="text-[11px] text-[#737373] dark:text-white/40 mt-0.5">
        Safari browser-માં ખોલો
      </p>
    </div>
  )
}

export function InstallPWAButton({ collapsed = false }: InstallPWAButtonProps) {
  const { canInstall, promptInstall, isIOS } = useInstallPrompt()
  const [popoverOpen, setPopoverOpen] = useState(false)

  if (!canInstall && !isIOS) return null

  async function handleClick() {
    if (isIOS) {
      setPopoverOpen((prev) => !prev)
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

  if (isIOS) {
    return (
      <Popover
        open={popoverOpen}
        onOpenChange={setPopoverOpen}
        content={<IOSInstructions />}
        trigger="click"
        placement="top"
        arrow={false}
      >
        {button}
      </Popover>
    )
  }

  return button
}
