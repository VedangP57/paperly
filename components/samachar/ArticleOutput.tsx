'use client'

import { useState } from 'react'
import { Button, Tag, App, Input } from 'antd'
import { Copy, Check, Pencil, X, Save } from 'lucide-react'
import { toGujaratiNumerals } from '@/lib/utils'

const { TextArea } = Input

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
  onArticleUpdate?: (updated: Article) => void
}

export function ArticleOutput({ article, category, onArticleUpdate }: Props) {
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Article>(article)
  const { notification } = App.useApp()

  // Sync draft when article changes externally (e.g. after AI refine)
  useState(() => { setDraft(article) })

  async function handleCopy() {
    const text = `${article.headline}\n${article.subheadline}\n\n${article.article_body}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    notification.success({ title: 'કૉપિ થઈ ગયું!', description: 'સમાચાર clipboard માં save થઈ ગયા.', duration: 2 })
    setTimeout(() => setCopied(false), 2000)
  }

  function startEdit() {
    setDraft(article)
    setEditing(true)
  }

  function cancelEdit() {
    setDraft(article)
    setEditing(false)
  }

  function saveEdit() {
    const wordCount = draft.article_body?.split(/\s+/).filter(Boolean).length ?? 0
    const updated = { ...draft, word_count: wordCount }
    onArticleUpdate?.(updated)
    setEditing(false)
    notification.success({ title: 'સાચવ્યું!', duration: 2 })
  }

  const displayWordCount = editing
    ? (draft.article_body?.split(/\s+/).filter(Boolean).length ?? 0)
    : article.word_count

  return (
    <div className="rounded-xl border border-[#e6e6e6] dark:border-white/10 bg-white dark:bg-[#1a1a1a] overflow-hidden shadow-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[#f0f0f0] dark:border-white/[0.07] bg-[#fafafa] dark:bg-[#222]">
        <div className="flex items-center gap-2">
          <Tag color="purple" className="!text-[11px] !font-semibold">{category}</Tag>
          {displayWordCount ? (
            <span className="text-[11px] text-muted-foreground">{toGujaratiNumerals(displayWordCount)} શબ્દ</span>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5">
          {!editing ? (
            <>
              <Button
                size="small"
                icon={<Pencil className="h-3.5 w-3.5" />}
                onClick={startEdit}
                className="!text-[#5b5fc7] !border-[#5b5fc7]/30 hover:!bg-[#5b5fc7]/10"
              >
                સંપાદન
              </Button>
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
            </>
          ) : (
            <>
              <Button
                size="small"
                icon={<X className="h-3.5 w-3.5" />}
                onClick={cancelEdit}
                className="!text-muted-foreground !border-[#e6e6e6] hover:!bg-[#f0f0f0] dark:hover:!bg-white/10"
              >
                રદ
              </Button>
              <Button
                size="small"
                type="primary"
                icon={<Save className="h-3.5 w-3.5" />}
                onClick={saveEdit}
                className="!bg-[#5b5fc7] hover:!bg-[#4f52b2] !border-none"
              >
                સાચવો
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Article content */}
      <div className="p-5 space-y-3 font-[var(--font-gujarati)]">
        {editing ? (
          <>
            <Input
              value={draft.headline}
              onChange={(e) => setDraft((d) => ({ ...d, headline: e.target.value }))}
              className="!text-base !font-bold !leading-snug"
              placeholder="શીર્ષક..."
            />
            <Input
              value={draft.subheadline}
              onChange={(e) => setDraft((d) => ({ ...d, subheadline: e.target.value }))}
              className="!text-sm !border-l-2 !border-[#5b5fc7] !rounded-none !pl-3"
              placeholder="ઉપ-શીર્ષક..."
            />
            <div className="border-t border-[#f0f0f0] dark:border-white/[0.06] pt-3">
              <TextArea
                value={draft.article_body}
                onChange={(e) => setDraft((d) => ({ ...d, article_body: e.target.value }))}
                autoSize={{ minRows: 6 }}
                className="!text-[15px] !leading-relaxed !text-[#374151] dark:!text-white/80"
                placeholder="સમાચાર body..."
              />
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}
