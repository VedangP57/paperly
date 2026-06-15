'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from 'antd'

const STAGES = [
  { label: 'Claude વિચારી રહ્યા છે...', until: 6000 },
  { label: 'Article ઘડાઈ રહ્યો છે...', until: 14000 },
  { label: 'Supabase માં સાચવી રહ્યા છે...', until: Infinity },
]

export function GeneratingPlaceholder() {
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    const timers = STAGES.slice(0, -1).map((s, i) =>
      setTimeout(() => setStageIndex(i + 1), s.until)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="rounded-xl border border-[#e6e6e6] dark:border-white/10 bg-white dark:bg-[#1a1a1a] overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-[#f0f0f0] dark:border-white/[0.07] bg-[#fafafa] dark:bg-[#222]">
        <p className="text-sm font-semibold text-[#5b5fc7] dark:text-[#a5a3e0] animate-pulse">
          {STAGES[stageIndex].label}
        </p>
      </div>
      <div className="p-5 space-y-4">
        <Skeleton.Input active block style={{ height: 28, borderRadius: 6 }} />
        <Skeleton.Input active block style={{ height: 20, borderRadius: 6, width: '65%' }} />
        <div className="border-t border-[#f0f0f0] dark:border-white/[0.06] pt-3 space-y-2">
          <Skeleton.Input active block style={{ height: 15, borderRadius: 4 }} />
          <Skeleton.Input active block style={{ height: 15, borderRadius: 4, width: '92%' }} />
          <Skeleton.Input active block style={{ height: 15, borderRadius: 4, width: '85%' }} />
          <Skeleton.Input active block style={{ height: 15, borderRadius: 4, width: '97%' }} />
          <Skeleton.Input active block style={{ height: 15, borderRadius: 4, width: '78%' }} />
          <Skeleton.Input active block style={{ height: 15, borderRadius: 4, width: '88%' }} />
        </div>
      </div>
    </div>
  )
}
