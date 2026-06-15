'use client'

import { RotateCcw } from 'lucide-react'
import { toGujaratiNumerals } from '@/lib/utils'

interface Props {
  category: string
  inputData: Record<string, string>
  wordCount: number
  onReopen: () => void
}

export function FormSummaryChip({ category, inputData, wordCount, onReopen }: Props) {
  const firstValue = Object.values(inputData).find((v) => v?.trim()) ?? ''
  const preview = firstValue.slice(0, 28) + (firstValue.length > 28 ? '...' : '')

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f5f5f5] dark:bg-white/5 rounded-xl border border-[#e6e6e6] dark:border-white/10 text-sm">
      <span className="font-semibold text-[#18181b] dark:text-white shrink-0">{category}</span>
      {preview && (
        <>
          <span className="text-muted-foreground shrink-0">·</span>
          <span className="text-muted-foreground truncate">{preview}</span>
        </>
      )}
      <span className="text-muted-foreground shrink-0">·</span>
      <span className="text-muted-foreground shrink-0">~{toGujaratiNumerals(wordCount)} શ.</span>
      <button
        type="button"
        onClick={onReopen}
        className="ml-auto flex items-center gap-1 text-[#5b5fc7] hover:underline text-xs cursor-pointer shrink-0"
      >
        <RotateCcw className="h-3 w-3" />
        ફરી ભરો
      </button>
    </div>
  )
}
