'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Slider, App } from 'antd'
import { Sparkles, ArrowLeft } from 'lucide-react'
import { CategoryPicker, type Category } from './CategoryPicker'
import { WeatherForm } from './WeatherForm'
import { GeneralForm } from './GeneralForm'
import { ArticleOutput } from './ArticleOutput'
import { RefinementChat } from './RefinementChat'
import { FormSummaryChip } from './FormSummaryChip'
import { GeneratingPlaceholder } from './GeneratingPlaceholder'
import { toGujaratiNumerals } from '@/lib/utils'

interface Article {
  id?: string
  headline: string
  subheadline: string
  article_body: string
  word_count?: number
}

interface Props {
  initialArticle?: Article
  initialCategory?: string
  initialFormData?: Record<string, string>
  initialWordCount?: number
}

export function ChatThread({
  initialArticle,
  initialCategory,
  initialFormData = {},
  initialWordCount = 200,
}: Props) {
  const router = useRouter()
  const { notification } = App.useApp()

  const [view, setView] = useState<'empty' | 'form' | 'generated'>(
    initialArticle ? 'generated' : 'empty'
  )
  const [category, setCategory] = useState<Category | null>(
    (initialCategory as Category) ?? null
  )
  const [formData, setFormData] = useState<Record<string, string>>(initialFormData)
  const [wordCount, setWordCount] = useState(initialWordCount)
  const [article, setArticle] = useState<Article | null>(initialArticle ?? null)
  const [generating, setGenerating] = useState(false)

  function handleCategoryPick(c: Category) {
    setCategory(c)
    setFormData({})
    setView('form')
  }

  function handleBack() {
    setView('empty')
    setCategory(null)
    setFormData({})
  }

  async function handleGenerate() {
    if (!category) return
    if (!Object.values(formData).some((v) => v?.trim())) {
      notification.warning({ title: 'ઓછામાં ઓછી એક વિગત ભરો' })
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
      setView('generated')
      router.push(`/samachar/${data.id}`)
    } catch (err) {
      notification.error({ title: 'ભૂલ', description: String(err) })
    } finally {
      setGenerating(false)
    }
  }

  // ── State: empty ──────────────────────────────────────────────────
  if (view === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-6 py-16">
        <p className="text-sm text-muted-foreground mb-6">
          સમાચારનો પ્રકાર પસંદ કરો
        </p>
        <div className="w-full max-w-lg">
          <CategoryPicker selected={null} onChange={handleCategoryPick} />
        </div>
      </div>
    )
  }

  // ── State: form ───────────────────────────────────────────────────
  if (view === 'form') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Back + category label */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#374151] dark:text-white/70"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <p className="text-sm font-semibold text-[#18181b] dark:text-white">{category}</p>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-[#e6e6e6] dark:border-white/10 bg-white dark:bg-[#1a1a1a] shadow-sm p-4">
          {category === 'હવામાન' ? (
            <WeatherForm data={formData} onChange={setFormData} />
          ) : (
            <GeneralForm category={category!} data={formData} onChange={setFormData} />
          )}
        </div>

        {/* Word count + generate */}
        <div className="rounded-xl border border-[#e6e6e6] dark:border-white/10 bg-white dark:bg-[#1a1a1a] shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#f0f0f0] dark:border-white/[0.07] bg-[#fafafa] dark:bg-[#222]">
            <p className="text-sm font-semibold text-[#18181b] dark:text-white">
              સમાચારની લંબાઈ: ~{toGujaratiNumerals(wordCount)} શબ્દ
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
              tooltip={{ formatter: (value) => toGujaratiNumerals(value ?? 0) }}
              className="!mb-10"
            />
            <Button
              type="primary"
              size="middle"
              block
              loading={generating}
              onClick={handleGenerate}
              icon={<Sparkles className="h-4 w-4" />}
              className="!h-10 !rounded-xl !text-sm !font-semibold !bg-[#5b5fc7] hover:!bg-[#4f52b2] !border-none"
            >
              {generating ? 'સમાચાર લખાઈ રહ્યા છે...' : 'સમાચાર બનાવો'}
            </Button>
          </div>
        </div>

        {generating && <GeneratingPlaceholder />}
      </div>
    )
  }

  // ── State: generated ──────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {category && (
        <FormSummaryChip
          category={category}
          inputData={formData}
          wordCount={wordCount}
          onReopen={() => setView('form')}
        />
      )}
      {article && (
        <>
          <ArticleOutput
            article={article}
            category={category ?? ''}
            onArticleUpdate={(updated) =>
              setArticle((prev) => (prev ? { ...prev, ...updated } : updated))
            }
          />
          <RefinementChat
            article={article}
            category={category ?? ''}
            onArticleUpdate={(updated) =>
              setArticle((prev) => (prev ? { ...prev, ...updated } : updated))
            }
          />
        </>
      )}
    </div>
  )
}
