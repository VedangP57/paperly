# Samachar API Reliability + Loading UI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace fragile JSON text parsing with Anthropic tool_use in both Samachar API routes to eliminate 500 errors, and add a staged Gujarati loading skeleton on the frontend.

**Architecture:** Both API routes define a `write_gujarati_article` tool with a strict schema; Claude is forced to call it via `tool_choice`, so the response is always a typed object — no `JSON.parse`, no regex, no truncation risk. The frontend renders a `GeneratingPlaceholder` card (3 cycling Gujarati stage labels + Ant Design Skeleton bars) while the 15–20s request is in flight.

**Tech Stack:** Next.js 16 App Router · TypeScript · `@anthropic-ai/sdk` · Ant Design v6 · Tailwind CSS v4

---

## File Map

| File | Action |
|------|--------|
| `app/api/samachar/generate/route.ts` | Modify — add tools/tool_choice, max_tokens 8192, remove JSON.parse |
| `app/api/samachar/refine/route.ts` | Modify — add tools/tool_choice + change_summary field, max_tokens 8192, remove JSON.parse |
| `components/samachar/GeneratingPlaceholder.tsx` | Create — skeleton card with cycling Gujarati stage labels |
| `components/samachar/SamacharTool.tsx` | Modify — render GeneratingPlaceholder when generating, show ArticleOutput only after done |

---

## Task 1: Update generate route to use tool_use

**Files:**
- Modify: `app/api/samachar/generate/route.ts`

- [ ] **Step 1: Replace the anthropic.messages.create call and result parsing**

Open `app/api/samachar/generate/route.ts`. Replace lines 108–117 (the create call + text parsing) with this:

```ts
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

    const toolBlock = response.content.find(
      (b): b is { type: 'tool_use'; input: { headline: string; subheadline: string; article_body: string } } =>
        b.type === 'tool_use'
    )
    if (!toolBlock) throw new Error('Claude did not return tool output')
    const parsed = toolBlock.input
```

- [ ] **Step 2: Verify the file compiles**

```bash
cd /Users/sarvadhisolution/Documents/Personal/paperly
npx tsc --noEmit 2>&1 | grep "samachar/generate"
```

Expected: no output (no errors for this file).

- [ ] **Step 3: Test via curl**

```bash
printf '%s' '{"category":"સ્થાનિક સમાચાર","inputData":{"location":"સુરત","event":"અડાજન","when":"સવારે 10:00 વાગે","involved":"મનીષ મલહોત્રા","impact":"પાંચ લોકોનું મૃત્યુ"},"wordCount":200}' > /tmp/samachar_test.json
curl -s -X POST http://localhost:3000/api/samachar/generate \
  -H "Content-Type: application/json" \
  --data @/tmp/samachar_test.json | python3 -m json.tool
```

Expected: JSON with `headline`, `subheadline`, `article_body`, `id`, `word_count`. No `error` key.

- [ ] **Step 4: Test weather category (long response)**

```bash
printf '%s' '{"category":"હવામાન","inputData":{"rawPaste":"Date = 14/06/2026\nMaxi :- 35.2\nMini. :- 28.8\nRH. :- 066%\nPP. :- 1005.2 hpa\nWind :- SW ( 12 kmph)","maxTemp":"35.2","minTemp":"28.8","humidity":"66","pressure":"1005.2","windDir":"દક્ષિણ-પશ્ચિમ","windSpeed":"12"},"wordCount":300}' > /tmp/samachar_weather.json
curl -s -X POST http://localhost:3000/api/samachar/generate \
  -H "Content-Type: application/json" \
  --data @/tmp/samachar_weather.json | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if 'article_body' in d else 'FAIL:', d.get('error',''), 'words:', d.get('word_count',''))"
```

Expected: `OK  words: 180` (or similar — no FAIL).

- [ ] **Step 5: Commit**

```bash
git add app/api/samachar/generate/route.ts
git commit -m "fix(samachar): switch generate route to tool_use, raise max_tokens to 8192"
```

---

## Task 2: Update refine route to use tool_use

**Files:**
- Modify: `app/api/samachar/refine/route.ts`

- [ ] **Step 1: Replace system prompt JSON instruction and the create call + parsing**

Open `app/api/samachar/refine/route.ts`. 

First, in the `systemPrompt` string, remove the entire `## Output Format (STRICT JSON)` block (lines 33–40 in the original). The system prompt should end after the `change_summary` description line. Replace from `## Output Format` to end of template literal with:

```ts
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
```

Then replace lines 43–57 (the anthropic.messages.create call + text parsing) with:

```ts
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

    const toolBlock = response.content.find(
      (b): b is {
        type: 'tool_use'
        input: { headline: string; subheadline: string; article_body: string; change_summary: string }
      } => b.type === 'tool_use'
    )
    if (!toolBlock) throw new Error('Claude did not return tool output')
    const parsed = toolBlock.input
```

- [ ] **Step 2: Verify the file compiles**

```bash
npx tsc --noEmit 2>&1 | grep "samachar/refine"
```

Expected: no output.

- [ ] **Step 3: Test refine via curl**

First generate an article and note the returned `id`, then:

```bash
printf '%s' '{"articleId":"PASTE_ID_HERE","message":"આ સમાચાર ટૂંકા કરો","currentArticle":{"headline":"પરીક્ષણ શીર્ષક","subheadline":"પરીક્ષણ ઉપ-શીર્ષક","article_body":"સુરત, તા. ૧૫ જૂન:\n\nઆ એક પરીક્ષણ article છે.\n\nબીજો ફકરો."},"category":"સ્થાનિક સમાચાર"}' > /tmp/samachar_refine.json
curl -s -X POST http://localhost:3000/api/samachar/refine \
  -H "Content-Type: application/json" \
  --data @/tmp/samachar_refine.json | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if 'change_summary' in d else 'FAIL:', d.get('error','change_summary present: ' + str('change_summary' in d)))"
```

Expected: `OK`.

- [ ] **Step 4: Commit**

```bash
git add app/api/samachar/refine/route.ts
git commit -m "fix(samachar): switch refine route to tool_use, raise max_tokens to 8192"
```

---

## Task 3: Create GeneratingPlaceholder component

**Files:**
- Create: `components/samachar/GeneratingPlaceholder.tsx`

- [ ] **Step 1: Create the file**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from 'antd'

const STAGES: { label: string; until: number }[] = [
  { label: 'Claude વિચારી રહ્યા છે...', until: 6000 },
  { label: 'Article ઘડાઈ રહ્યો છે...', until: 14000 },
  { label: 'Supabase માં સાચવી રહ્યા છે...', until: Infinity },
]

export function GeneratingPlaceholder() {
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    const timers = STAGES.slice(0, -1).map((s, i) =>
      setTimeout(() => setStageIndex(i + 1), s.until)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="rounded-xl border border-[#e6e6e6] dark:border-white/10 bg-white dark:bg-[#1a1a1a] overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-[#f0f0f0] dark:border-white/[0.07] bg-[#fafafa] dark:bg-[#222]">
        <p className="text-sm font-semibold text-[#5b5fc7] dark:text-[#a5a3e0] animate-pulse">
          {STAGES[stageIndex].label}
        </p>
      </div>
      <div className="p-5 space-y-4">
        <Skeleton.Input active block style={{ height: 28, borderRadius: 6 }} />
        <Skeleton.Input active block style={{ height: 20, borderRadius: 6, width: '65%' }} />
        <div className="border-t border-[#f0f0f0] dark:border-white/[0.06] pt-3 space-y-2">
          <Skeleton.Input active block style={{ height: 15, borderRadius: 4 }} />
          <Skeleton.Input active block style={{ height: 15, borderRadius: 4, width: '92%' }} />
          <Skeleton.Input active block style={{ height: 15, borderRadius: 4, width: '85%' }} />
          <Skeleton.Input active block style={{ height: 15, borderRadius: 4, width: '97%' }} />
          <Skeleton.Input active block style={{ height: 15, borderRadius: 4, width: '78%' }} />
          <Skeleton.Input active block style={{ height: 15, borderRadius: 4, width: '88%' }} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit 2>&1 | grep "GeneratingPlaceholder"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add components/samachar/GeneratingPlaceholder.tsx
git commit -m "feat(samachar): add GeneratingPlaceholder skeleton with Gujarati stage labels"
```

---

## Task 4: Wire GeneratingPlaceholder into SamacharTool

**Files:**
- Modify: `components/samachar/SamacharTool.tsx`

- [ ] **Step 1: Add import at top of file**

In `components/samachar/SamacharTool.tsx`, add to the existing import block:

```ts
import { GeneratingPlaceholder } from './GeneratingPlaceholder'
```

- [ ] **Step 2: Replace the article output section**

Find the comment `{/* Article Output + Refinement */}` and the block below it. Replace with:

```tsx
          {/* Article Output + Refinement */}
          {generating && <GeneratingPlaceholder />}
          {!generating && article && category && (
            <>
              <ArticleOutput article={article} category={category} />
              <RefinementChat
                article={article}
                category={category}
                onArticleUpdate={(updated) => setArticle((prev) => prev ? { ...prev, ...updated } : updated)}
              />
            </>
          )}
```

- [ ] **Step 3: Verify it compiles**

```bash
npx tsc --noEmit 2>&1 | grep "SamacharTool"
```

Expected: no output.

- [ ] **Step 4: Full TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 5: Visual test on mobile**

Open `http://localhost:3000/dashboard/samachar` on your phone (or browser DevTools mobile mode). Select a category, fill in details, tap Generate. Verify:

- Button shows `"સમાચાર લખાઈ રહ્યા છે..."` with spinner
- Skeleton card appears below with pulsing bars
- Label reads `"Claude વિચારી રહ્યા છે..."` for first 6s, then `"Article ઘડાઈ રહ્યો છે..."`, then `"Supabase માં સાચવી રહ્યા છે..."`
- When done: skeleton disappears, article card appears with no layout jump

- [ ] **Step 6: Final commit**

```bash
git add components/samachar/SamacharTool.tsx
git commit -m "feat(samachar): show GeneratingPlaceholder skeleton during article generation"
```
