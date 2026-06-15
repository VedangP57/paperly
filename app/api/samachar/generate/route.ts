import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MASTER_SYSTEM_PROMPT = `તમે ગુજરાત સમાચારના ૨૫ વર્ષના અનુભવી વરિષ્ઠ તંત્રી છો. સુરત આવૃત્તિ.

## ભૂમિકા
- ગુજરાત સમાચાર અખબારની ઔપચારિક પત્રકારત્વ શૈલીના નિષ્ણાત
- ઊંધો ત્રિકોણ (Inverted Pyramid) માળખામાં સમાચાર લખો
- ગુજરાતી ભાષા: ૧૦૦% — અંગ્રેજી ફક્ત proper noun માટે (iPhone, Modi, BMW)

## ફરજિયાત નિયમો
1. ૧૦૦% ગુજરાતી — romanized ગુજરાતી ક્યારેય નહીં
2. ઔપચારિક, સ્ટ્ટ ભાષા — slang, casual words બિલ્કુલ નહીં
3. Opening line: "સુરત, તા. X:" થી શરૂ + સૌથી મહત્ત્વની ઘટના
4. ટૂંકા ફકરા: ૨-૩ વાક્ય max
5. Active voice preferred
6. Numbers: ગુજરાતી numerals (1→૧, 2→૨, 3→૩, etc.) where appropriate

## Output Format (STRICT JSON)
Respond ONLY with valid JSON — no markdown, no extra text:
{
  "headline": "...",
  "subheadline": "...",
  "article_body": "..."
}

headline: ૧૦-૧૨ શબ્દ, ધ્યાન ખેંચે, fact-first
subheadline: headline ન આવરે તે context (1 line)
article_body: inverted pyramid, paragraphs separated by \\n\\n`

const CATEGORY_PROMPTS: Record<string, string> = {
  'હવામાન': `## હવામાન સમાચાર — વિશેષ સૂચના
- ડેટાને લોકો સુધી translate કરો: "35.2°C → ભારે ઉકળાટ", "RH 90% → ઉકળાટ ભર્યો ભેજ"
- hPa pressure: >1010 = સ્વાભાવિક, <1005 = વાવાઝોડું/ઓછું દબાણ
- Wind SW means monsoon approach — ઉલ્લેખ કરો
- Impact on daily life: ખેડૂત, schoolchildren, ternager, vendor — ઉલ્લેખ કરો
- ક્યારેય raw numbers alone નહીં — હંમેશાં interpret કરો`,

  'સ્થાનિક સમાચાર': `## સ્થાનિક સમાચાર — વિશેષ સૂચના
- Community relevance first
- Location precise: area, ward, locality
- Impact on residents: traffic, health, development
- Quotes: "...XXXXXએ જણાવ્યું" / "...XXXXXએ ઉમેર્યું"`,

  'રાજકારણ': `## રાજકારણ સમાચાર — વિશેષ સૂચના
- Balanced, objective reporting — no bias
- Attribution every claim: "...XXXXXએ કહ્યું" / "...XXXXXના જણાવ્યા અનુસાર"
- No editorial opinions — facts only
- Party name, position, constituency always mention`,

  'ગુના સમાચાર': `## ગુના સમาચાર — વિશેષ સૂચના
- Police station always mention
- Time + location of incident first
- Victim: no full name if unverified — use "એક વ્યક્તિ" or partial name
- Accused: mention if FIR filed, else "તપાસ ચાલુ"
- Case number / section if available
- Formal tone — no sensationalism`,

  'અકસ્માત': `## અકસ્માત સમાચાર — વિશેષ સૂચના
- Time + exact location first
- Vehicles involved, road/highway name
- Casualties: injured vs dead — precise count
- Hospital name where admitted
- Police station handling case
- Cause if established, else "કારણ તપાસ"`,

  'તહેવાર / સામાજિક': `## તહેવાર / સામાજિક — વિશેષ સૂચના
- Warm, community-positive tone
- Turnout / attendance figure mention
- Organizer + key participants
- Highlight moment or special element
- Community sentiment: "ઉત્સાહ", "ભક્તિભાવ", "આનંદ"
- Official guest if any`,
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { category, inputData, wordCount = 200 } = body as {
    category: string
    inputData: Record<string, string>
    wordCount: number
  }

  if (!category || !inputData) {
    return NextResponse.json({ error: 'category and inputData required' }, { status: 400 })
  }

  const categoryPrompt = CATEGORY_PROMPTS[category] ?? ''
  const inputSummary = Object.entries(inputData)
    .filter(([, v]) => v?.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')

  const userMessage = `${categoryPrompt}

## સમાચાર ઇનપુટ
Category: ${category}
Word target: ~${wordCount} words for article_body

${inputSummary}

ઉપરના facts પરથી ગુજરાત સમાચારની શૈલીમાં સમાચાર લખો.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: MASTER_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const raw = (response.content[0] as { text: string }).text.trim()
    // Strip markdown code fences if present
    const jsonStr = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(jsonStr) as { headline: string; subheadline: string; article_body: string }

    const wordCount_ = parsed.article_body?.split(/\s+/).filter(Boolean).length ?? 0

    const { data: saved, error: dbError } = await supabase
      .from('samachar_articles')
      .insert({
        user_id: user.id,
        category,
        input_data: inputData,
        headline: parsed.headline,
        subheadline: parsed.subheadline,
        article_body: parsed.article_body,
        word_count: wordCount_,
        refinement_history: [],
      })
      .select()
      .single()

    if (dbError) console.error('DB save error:', dbError)

    return NextResponse.json({ ...parsed, id: saved?.id, word_count: wordCount_ })
  } catch (err) {
    console.error('Samachar generate error:', err)
    return NextResponse.json({ error: 'Article generation failed. Please try again.' }, { status: 500 })
  }
}
