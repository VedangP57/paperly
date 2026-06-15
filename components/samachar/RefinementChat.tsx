'use client'

import { useState, useRef, useEffect } from 'react'
import { Input, Button, App } from 'antd'
import { Send } from 'lucide-react'
import { VoiceButton } from './VoiceButton'

interface Message {
  role: 'user' | 'assistant'
  text: string
}

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
  onArticleUpdate: (updated: Article) => void
}

const QUICK_PROMPTS = [
  'આ સમાચાર ટૂંકા કરો',
  'વધુ નાટ્યાત્મક શીર્ષક',
  'ઔપચારિક ભાષા વધારો',
  'છેલ્લો ફકરો બદલો',
]

export function RefinementChat({ article, category, onArticleUpdate }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const { notification } = App.useApp()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text: string) {
    if (!text.trim() || loading) return
    const userMsg = text.trim()
    setInput('')
    setMessages((m) => [...m, { role: 'user', text: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/samachar/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: article.id,
          message: userMsg,
          currentArticle: article,
          category,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      onArticleUpdate({
        ...article,
        headline: data.headline,
        subheadline: data.subheadline,
        article_body: data.article_body,
        word_count: data.word_count,
      })
      setMessages((m) => [...m, { role: 'assistant', text: data.change_summary ?? 'સમાચાર અપડેટ થઈ ગયા.' }])
    } catch (err) {
      notification.error({ title: 'ભૂલ', description: String(err) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-[#e6e6e6] dark:border-white/10 bg-white dark:bg-[#1a1a1a] overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-[#f0f0f0] dark:border-white/[0.07] bg-[#fafafa] dark:bg-[#222]">
        <p className="text-sm font-semibold text-[#18181b] dark:text-white">સમાચાર સુધારો</p>
        <p className="text-xs text-muted-foreground">ગુજરાતીમાં ટાઈપ અથવા બોલો — AI article update કરશે</p>
      </div>

      {/* Quick prompts */}
      <div className="flex flex-wrap gap-1.5 px-4 pt-3">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => send(p)}
            disabled={loading}
            className="text-[12px] px-2.5 py-1 rounded-full border border-[#5b5fc7]/30 text-[#5b5fc7] hover:bg-[#5b5fc7]/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Message history */}
      {messages.length > 0 && (
        <div className="max-h-48 overflow-y-auto px-4 pt-3 pb-1 space-y-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <span
                className={`text-sm px-3 py-1.5 rounded-xl max-w-[85%] ${
                  m.role === 'user'
                    ? 'bg-[#5b5fc7] text-white'
                    : 'bg-[#f0f0f0] dark:bg-white/10 text-[#374151] dark:text-white/80'
                }`}
              >
                {m.text}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 p-3">
        <VoiceButton onResult={(t) => setInput((prev) => prev + t + ' ')} />
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={() => send(input)}
          placeholder="ગુજરાતીમાં સૂચન ટાઈપ કરો..."
          disabled={loading}
          className="flex-1"
        />
        <Button
          type="primary"
          icon={<Send className="h-3.5 w-3.5" />}
          loading={loading}
          onClick={() => send(input)}
          className="!bg-[#5b5fc7] hover:!bg-[#4f52b2] !border-none"
        />
      </div>
    </div>
  )
}
