import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { articleId, message, currentArticle, category } = body as {
    articleId: string
    message: string
    currentArticle: { headline: string; subheadline: string; article_body: string }
    category: string
  }

  if (!message || !currentArticle) {
    return NextResponse.json({ error: 'message and currentArticle required' }, { status: 400 })
  }

  const systemPrompt = `તમે ગુજરાત સમાચારના વરિષ્ઠ તંત્રી છો. નીચે આપેલ સમાચારને user ના સૂચન મુજબ સુધારો.

## ફરજિયાત નિયમો
- ૧૦૦% ગુજરાતી ભાષા — અંગ્રેજી ફક્ત proper noun
- ઔપચારિક, print-ready ભાષા
- User ના request ને follow કરો — but ગુજરાત સમાચાર શૈલી maintain કરો

## Current Article (Category: ${category})
Headline: ${currentArticle.headline}
Subheadline: ${currentArticle.subheadline}
Article Body:
${currentArticle.article_body}

## Output Format (STRICT JSON)
{
  "headline": "...",
  "subheadline": "...",
  "article_body": "...",
  "change_summary": "..."
}
change_summary: 1 sentence in Gujarati describing what was changed`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
    })

    const raw = (response.content[0] as { text: string }).text.trim()
    const jsonStr = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(jsonStr) as {
      headline: string
      subheadline: string
      article_body: string
      change_summary: string
    }

    const wordCount = parsed.article_body?.split(/\s+/).filter(Boolean).length ?? 0

    if (articleId) {
      const { data: existing } = await supabase
        .from('samachar_articles')
        .select('refinement_history')
        .eq('id', articleId)
        .eq('user_id', user.id)
        .single()

      const history = (existing?.refinement_history as unknown[]) ?? []
      history.push({
        message,
        change_summary: parsed.change_summary,
        timestamp: new Date().toISOString(),
      })

      await supabase
        .from('samachar_articles')
        .update({
          headline: parsed.headline,
          subheadline: parsed.subheadline,
          article_body: parsed.article_body,
          word_count: wordCount,
          refinement_history: history,
        })
        .eq('id', articleId)
        .eq('user_id', user.id)
    }

    return NextResponse.json({ ...parsed, word_count: wordCount })
  } catch (err) {
    console.error('Samachar refine error:', err)
    return NextResponse.json({ error: 'Refinement failed. Please try again.' }, { status: 500 })
  }
}
