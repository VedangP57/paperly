'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Segmented, Slider, App } from 'antd'
import { Sparkles, History, PenLine } from 'lucide-react'
import { CategoryPicker, type Category } from './CategoryPicker'
import { WeatherForm } from './WeatherForm'
import { GeneralForm } from './GeneralForm'
import { ArticleOutput } from './ArticleOutput'
import { RefinementChat } from './RefinementChat'
import { ArticleHistory } from './ArticleHistory'

interface Article {
  id?: string
  headline: string
  subheadline: string
  article_body: string
  word_count?: number
}

interface HistoryArticle {
  id: string
  created_at: string
  category: string
  headline: string
  subheadline: string
  article_body: string
  word_count: number
}

interface Props {
  initialHistory: HistoryArticle[]
}

export function SamacharTool({ initialHistory }: Props) {
  const [tab, setTab] = useState<'create' | 'history'>('create')
  const [category, setCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [wordCount, setWordCount] = useState(200)
  const [article, setArticle] = useState<Article | null>(null)
  const [generating, setGenerating] = useState(false)
  const [history, setHistory] = useState<HistoryArticle[]>(initialHistory)
  const [historyLoading, setHistoryLoading] = useState(false)
  const { notification } = App.useApp()

  const refreshHistory = useCallback(async () => {
    setHistoryLoading(true)
    try {
      const res = await fetch('/api/samachar/history')
      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  // Reset form when category changes
  useEffect(() => {
    setFormData({})
    setArticle(null)
  }, [category])

  async function handleGenerate() {
    if (!category) {
      notification.warning({ message: 'Category પસંદ કરો' })
      return
    }
    const hasInput = Object.values(formData).some((v) => v?.trim())
    if (!hasInput) {
      notification.warning({ message: 'ઓછામાં ઓછી એક વિગત ભરો' })
      return
    }

    setGenerating(true)
    try {
      const res = await fetch('/api/samachar/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, inputData: formData, wordCount }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setArticle(data)
      refreshHistory()
    } catch (err) {
      notification.error({ message: 'ભૂલ', description: String(err) })
    } finally {
      setGenerating(false)
    }
  }

  function handleRegenerate(histArticle: HistoryArticle) {
    setCategory(histArticle.category as Category)
    setFormData((histArticle as unknown as { input_data: Record<string, string> }).input_data ?? {})
    setTab('create')
    setArticle(null)
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Tab switcher */}
      <div className="shrink-0 px-5 pb-3">
        <Segmented
          value={tab}
          onChange={(v) => {
            setTab(v as 'create' | 'history')
            if (v === 'history') refreshHistory()
          }}
          options={[
            { label: <span className="flex items-center gap-1.5"><PenLine className="h-3.5 w-3.5" />સમાચાર લખો</span>, value: 'create' },
            { label: <span className="flex items-center gap-1.5"><History className="h-3.5 w-3.5" />ઇતિહાસ</span>, value: 'history' },
          ]}
          className="!rounded-full"
        />
      </div>

      {tab === 'history' ? (
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          <ArticleHistory
            articles={history}
            loading={historyLoading}
            onRegenerate={handleRegenerate}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-5">

          {/* Step 1 — Category */}
          <section className="rounded-xl border border-[#e6e6e6] dark:border-white/10 bg-white dark:bg-[#1a1a1a] shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#f0f0f0] dark:border-white/[0.07] bg-[#fafafa] dark:bg-[#222]">
              <p className="text-sm font-semibold text-[#18181b] dark:text-white">
                ① સમાચારનો પ્રકાર
              </p>
            </div>
            <div className="p-4">
              <CategoryPicker selected={category} onChange={setCategory} />
            </div>
          </section>

          {/* Step 2 — Form (only if category selected) */}
          {category && (
            <section className="rounded-xl border border-[#e6e6e6] dark:border-white/10 bg-white dark:bg-[#1a1a1a] shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[#f0f0f0] dark:border-white/[0.07] bg-[#fafafa] dark:bg-[#222]">
                <p className="text-sm font-semibold text-[#18181b] dark:text-white">
                  ② વિગત ભરો — {category}
                </p>
              </div>
              <div className="p-4">
                {category === 'હવામાન' ? (
                  <WeatherForm
                    data={formData}
                    onChange={setFormData}
                  />
                ) : (
                  <GeneralForm
                    category={category}
                    data={formData}
                    onChange={setFormData}
                  />
                )}
              </div>
            </section>
          )}

          {/* Step 3 — Word count + Generate */}
          {category && (
            <section className="rounded-xl border border-[#e6e6e6] dark:border-white/10 bg-white dark:bg-[#1a1a1a] shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[#f0f0f0] dark:border-white/[0.07] bg-[#fafafa] dark:bg-[#222]">
                <p className="text-sm font-semibold text-[#18181b] dark:text-white">
                  ③ Article ની લંબાઈ: ~{wordCount} શબ્દ
                </p>
              </div>
              <div className="px-6 py-4">
                <Slider
                  min={100}
                  max={300}
                  step={50}
                  value={wordCount}
                  onChange={setWordCount}
                  marks={{ 100: '૧૦૦', 150: '૧૫૦', 200: '૨૦૦', 250: '૨૫૦', 300: '૩૦૦' }}
                  className="!mb-6"
                />
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={generating}
                  onClick={handleGenerate}
                  icon={<Sparkles className="h-4 w-4" />}
                  className="!h-12 !rounded-xl !text-base !font-semibold !bg-[#5b5fc7] hover:!bg-[#4f52b2] !border-none"
                >
                  {generating ? 'સમાચાર લખાઈ રહ્યા છે...' : 'સમાચાર Generate કરો'}
                </Button>
              </div>
            </section>
          )}

          {/* Article Output */}
          {article && category && (
            <>
              <ArticleOutput article={article} category={category} />
              <RefinementChat
                article={article}
                category={category}
                onArticleUpdate={(updated) => setArticle((prev) => prev ? { ...prev, ...updated } : updated)}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}
