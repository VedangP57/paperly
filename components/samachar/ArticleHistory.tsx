'use client'

import { useState } from 'react'
import { Input, Button, App, Empty, Spin, Tag } from 'antd'
import { Copy, Search, RefreshCw } from 'lucide-react'
import { CATEGORIES } from './CategoryPicker'
import { formatDate } from '@/lib/utils'

interface Article {
  id: string
  created_at: string
  category: string
  headline: string
  subheadline: string
  article_body: string
  word_count: number
}

interface Props {
  articles: Article[]
  loading: boolean
  onRegenerate: (article: Article) => void
}

function getCategoryColor(category: string) {
  return CATEGORIES.find((c) => c.value === category)?.color ?? '#5b5fc7'
}

export function ArticleHistory({ articles, loading, onRegenerate }: Props) {
  const [search, setSearch] = useState('')
  const { notification } = App.useApp()

  async function copyArticle(article: Article) {
    const text = `${article.headline}\n${article.subheadline}\n\n${article.article_body}`
    await navigator.clipboard.writeText(text)
    notification.success({ message: 'કૉપિ થઈ ગયું!', duration: 2 })
  }

  const filtered = articles.filter((a) =>
    a.headline?.toLowerCase().includes(search.toLowerCase()) ||
    a.category?.includes(search) ||
    a.article_body?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="ગુજરાતીમાં શોધો — headline, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-full"
          allowClear
        />
      </div>

      {filtered.length === 0 ? (
        <Empty description="કોઈ સમાચાર મળ્યા નહીં" />
      ) : (
        <div className="space-y-3">
          {filtered.map((article) => {
            const color = getCategoryColor(article.category)
            return (
              <div
                key={article.id}
                className="rounded-xl border border-[#e6e6e6] dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-4 space-y-2 hover:border-[#c7c7c7] dark:hover:border-white/20 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag style={{ color, borderColor: `${color}44`, backgroundColor: `${color}11` }} className="!text-[11px] !font-semibold">
                        {article.category}
                      </Tag>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDate(article.created_at)}
                      </span>
                      {article.word_count && (
                        <span className="text-[11px] text-muted-foreground">{article.word_count} શ.</span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-[#18181b] dark:text-white leading-snug line-clamp-2">
                      {article.headline}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{article.subheadline}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="text"
                      size="small"
                      icon={<Copy className="h-3.5 w-3.5" />}
                      onClick={() => copyArticle(article)}
                      className="!text-[#5b5fc7] hover:!bg-[#5b5fc7]/10"
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<RefreshCw className="h-3.5 w-3.5" />}
                      onClick={() => onRegenerate(article)}
                      className="!text-muted-foreground hover:!text-[#5b5fc7] hover:!bg-[#5b5fc7]/10"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
