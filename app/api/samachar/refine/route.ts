import { NextResponse } from 'next/server'
import { createSamacharClient } from '@/lib/supabase/samachar'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
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
${currentArticle.article_body}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
      tools: [
        {
          name: 'refine_gujarati_article',
          description: 'Return the refined version of the Gujarati news article',
          input_schema: {
            type: 'object' as const,
            properties: {
              headline: { type: 'string', description: 'Updated Gujarati headline' },
              subheadline: { type: 'string', description: 'Updated Gujarati subheadline' },
              article_body: {
                type: 'string',
                description: 'Updated article body in Gujarati, paragraphs separated by \\n\\n',
              },
              change_summary: {
                type: 'string',
                description: '1 sentence in Gujarati describing what was changed',
              },
            },
            required: ['headline', 'subheadline', 'article_body', 'change_summary'],
          },
        },
      ],
      tool_choice: { type: 'tool' as const, name: 'refine_gujarati_article' },
    })

    const toolBlock = response.content.find((b) => b.type === 'tool_use')
    if (!toolBlock) throw new Error('Claude did not return tool output')
    const parsed = (toolBlock as {
      type: 'tool_use'
      input: { headline: string; subheadline: string; article_body: string; change_summary: string }
    }).input

    const wordCount = parsed.article_body?.split(/\s+/).filter(Boolean).length ?? 0

    if (articleId) {
      const supabase = createSamacharClient()
      const { data: existing } = await supabase
        .from('samachar_articles')
        .select('refinement_history')
        .eq('id', articleId)
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
    }

    return NextResponse.json({ ...parsed, word_count: wordCount })
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    console.error('Samachar refine error:', detail)
    return NextResponse.json({ error: detail }, { status: 500 })
  }
}
