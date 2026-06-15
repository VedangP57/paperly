'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface HistoryItem {
  id: string
  headline: string
  created_at: string
  category: string
}

interface Props {
  onItemClick?: () => void
}

export function ChatHistoryList({ onItemClick }: Props) {
  const [items, setItems] = useState<HistoryItem[]>([])
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/samachar/history')
      .then((r) => r.json())
      .then(setItems)
      .catch((err) => console.error('ChatHistoryList fetch error:', err))
  }, [pathname])  // re-fetch on every route change — catches new articles

  if (items.length === 0) {
    return (
      <p className="px-2 py-3 text-xs text-muted-foreground">
        હજી કોઈ સમાચાર નથી
      </p>
    )
  }

  return (
    <div className="space-y-0.5 py-1">
      {items.map((item) => {
        const isActive = pathname === `/samachar/${item.id}`
        const raw = item.headline ?? ''
        const title = raw.length > 34 ? raw.slice(0, 34) + '...' : raw
        return (
          <Link
            key={item.id}
            href={`/samachar/${item.id}`}
            onClick={onItemClick}
            className={`block px-2 py-2 rounded-lg text-sm transition-colors no-underline ${
              isActive
                ? 'bg-[#5b5fc7]/15 dark:bg-[#5b5fc7]/20 text-[#5b5fc7] font-medium'
                : 'text-[#374151] dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <span className="block truncate leading-snug">{title || 'Untitled'}</span>
            <span className="text-[11px] text-muted-foreground">{item.category}</span>
          </Link>
        )
      })}
    </div>
  )
}
