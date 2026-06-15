'use client'

import { useState } from 'react'
import { Button, Tag, App } from 'antd'
import { Copy, Check } from 'lucide-react'

interface Article {
  id?: string
  headline: string
  subheadline: string
  article_body: string
  word_count?: number
}

interface Props {
  article: Article
  category: string
}

export function ArticleOutput({ article, category }: Props) {
  const [copied, setCopied] = useState(false)
  const { notification } = App.useApp()

  async function handleCopy() {
    const text = `${article.headline}\n${article.subheadline}\n\n${article.article_body}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    notification.success({ message: 'કૉપિ થઈ ગયું!', description: 'સમાચાર clipboard માં save થઈ ગયા.', duration: 2 })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-[#e6e6e6] dark:border-white/10 bg-white dark:bg-[#1a1a1a] overflow-hidden shadow-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[#f0f0f0] dark:border-white/[0.07] bg-[#fafafa] dark:bg-[#222]">
        <div className="flex items-center gap-2">
          <Tag color="purple" className="!text-[11px] !font-semibold">{category}</Tag>
          {article.word_count && (
            <span className="text-[11px] text-muted-foreground">{article.word_count} શબ્દ</span>
          )}
        </div>
        <Button
          size="small"
          icon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          onClick={handleCopy}
          className={copied
            ? '!text-green-600 !border-green-300 !bg-green-50 dark:!bg-green-500/10'
            : '!text-[#5b5fc7] !border-[#5b5fc7]/30 hover:!bg-[#5b5fc7]/10'
          }
        >
          {copied ? 'કૉપિ!' : 'કૉપિ'}
        </Button>
      </div>

      {/* Article content */}
      <div className="p-5 space-y-3 font-[var(--font-gujarati)]">
        <h2 className="text-xl font-bold leading-snug text-[#18181b] dark:text-white tracking-tight">
          {article.headline}
        </h2>
        <p className="text-sm font-semibold text-[#5b5fc7] dark:text-[#a5a3e0] border-l-2 border-[#5b5fc7] pl-3">
          {article.subheadline}
        </p>
        <div className="border-t border-[#f0f0f0] dark:border-white/[0.06] pt-3">
          {article.article_body.split('\n\n').map((para, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-[#374151] dark:text-white/80 mb-3 last:mb-0">
              {para}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
