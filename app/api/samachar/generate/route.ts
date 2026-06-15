import { NextResponse } from 'next/server'
import { createSamacharClient } from '@/lib/supabase/samachar'
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

headline: ૧૦-૧૨ શબ્દ, ધ્યાન ખેંચે, fact-first
subheadline: headline ન આવરે તે context (1 line)
article_body: inverted pyramid, paragraphs separated by \\n\\n`

const CATEGORY_PROMPTS: Record<string, string> = {
  'હવામાન': `## હવામાન સમાચાર — વિશેષ સૂચના
- ડેટાને લોકો સુધી translate કરો: "35.2°C → ભારે ઉકળાટ", "RH 90% → ઉકળાટ ભર્યો ભેજ"
- hPa pressure: >1010 = સ્વાભાવિક, <1005 = વાવાઝોડું/ઓછું દબાણ
- Wind SW means monsoon approach — ઉલ્લેખ કરો
- Impact on daily life: ખેડૂત, schoolchildren, vendor — ઉલ્લેખ કરો
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

  'ગુના સમાચાર': `## ગુના સમાચાર — વિશેષ સૂચના
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

  'વહીવટ / સરકારી': `## વહીવટ / સરકારી સમાચાર — વિશેષ સૂચના
- Department / authority full name always mention (e.g. "સુરત મ્યુનિસિપલ કોર્પોરેશન")
- Official attribution every claim: "...XXXXXએ જણાવ્યું" / "...સૂત્રોના જણાવ્યા પ્રમાણે"
- Citizen impact first — how many people, which areas affected
- Effective date / implementation timeline clearly state
- Balanced, bureaucratic-neutral tone — no praise, no criticism
- Policy number / order reference if available`,

  'આરોગ્ય': `## આરોગ્ય સમાચાર — વિશેષ સૂચના
- Hospital / authority name always mention
- Precise case count / statistics — do not exaggerate
- Doctor or health official attribution for medical claims
- Public advisory if relevant: prevention tips, where to seek help
- Avoid alarming language; factual, calm tone
- Distinguish confirmed cases vs suspected / under observation
- Treatment available: yes/no + where`,

  'શિક્ષણ': `## શિક્ષણ સમાચાર — વિશેષ સૂચના
- Institution full name + board/university affiliation
- Student count / grade level affected clearly state
- Official source attribution: principal, education officer, board
- Dates: exam schedule, result date, admission deadline — precise
- Impact: fee change, syllabus update, infrastructure — specific
- Objective tone — no editorialising about quality of education
- Quote from educator or official if provided`,

  'અન્ય': `## અન્ય સમાચાર — વિશેષ સૂચના
- Reporter has provided freeform notes — extract all facts carefully
- Determine the most appropriate news angle from the input
- Apply Gujarat Samachar inverted pyramid: most important fact first
- Attribution: quote any named source with "...XXXXXએ જણાવ્યું"
- Maintain formal Gujarati journalistic tone throughout
- If location or date is unclear from input, omit rather than invent
- Make headline specific to the actual event described`,
}

export async function POST(request: Request) {
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
      max_tokens: 8192,
      system: MASTER_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
      tools: [
        {
          name: 'write_gujarati_article',
          description: 'Write a Gujarat Samachar style Gujarati news article',
          input_schema: {
            type: 'object' as const,
            properties: {
              headline: {
                type: 'string',
                description: '10-12 word Gujarati headline, fact-first, attention-grabbing',
              },
              subheadline: {
                type: 'string',
                description: 'One-line context not already in the headline',
              },
              article_body: {
                type: 'string',
                description:
                  'Full article body in 100% Gujarati. Inverted pyramid. Paragraphs separated by \\n\\n.',
              },
            },
            required: ['headline', 'subheadline', 'article_body'],
          },
        },
      ],
      tool_choice: { type: 'tool' as const, name: 'write_gujarati_article' },
    })

    const toolBlock = response.content.find((b) => b.type === 'tool_use')
    if (!toolBlock) throw new Error('Claude did not return tool output')
    const parsed = (toolBlock as { type: 'tool_use'; input: { headline: string; subheadline: string; article_body: string } }).input

    const wordCount_ = parsed.article_body?.split(/\s+/).filter(Boolean).length ?? 0

    const supabase = createSamacharClient()
    const { data: saved, error: dbError } = await supabase
      .from('samachar_articles')
      .insert({
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
    const detail = err instanceof Error ? err.message : String(err)
    console.error('Samachar generate error:', detail)
    return NextResponse.json({ error: detail }, { status: 500 })
  }
}
