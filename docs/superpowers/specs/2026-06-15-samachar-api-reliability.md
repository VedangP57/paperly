---
name: samachar-api-reliability
description: Fix Samachar generate/refine API reliability using Anthropic tool_use + add mobile loading UI
metadata:
  type: project
---

# Samachar API Reliability + Loading UI

## Problem

The `/api/samachar/generate` and `/api/samachar/refine` routes fail intermittently with 500 errors because:

1. `max_tokens: 1024` truncates Claude's Gujarati JSON response mid-string (~1096 chars into a 200-word article), causing `JSON.parse()` to throw `SyntaxError: Unterminated string`
2. The route parses Claude's text output with `JSON.parse()` — fragile if Claude adds markdown fences, explanations, or any non-JSON prefix
3. The refine route has the same `max_tokens: 1024` issue
4. On mobile (15–20s generation time) there is no staged loading feedback, so the user sees a frozen button with no progress indication

## Solution

### Backend: Anthropic Tool Use

Replace text-mode JSON parsing with Anthropic's `tools` / `tool_choice` API on both routes. Claude is forced to call a named tool and fill a strict schema — it cannot produce truncated or non-JSON output.

**Tool definition (generate route):**
```ts
tools: [{
  name: 'write_gujarati_article',
  description: 'Write a Gujarat Samachar style Gujarati news article',
  input_schema: {
    type: 'object',
    properties: {
      headline:     { type: 'string', description: '10-12 word Gujarati headline' },
      subheadline:  { type: 'string', description: '1-line context not in headline' },
      article_body: { type: 'string', description: 'Full article body, paragraphs separated by \\n\\n' },
    },
    required: ['headline', 'subheadline', 'article_body'],
  },
}]
tool_choice: { type: 'tool', name: 'write_gujarati_article' }
```

**Tool definition (refine route):** Same schema + `change_summary: string` field.

**Response parsing (replaces JSON.parse):**
```ts
const toolBlock = response.content.find(b => b.type === 'tool_use')
const parsed = toolBlock.input as { headline: string; subheadline: string; article_body: string }
```

Both routes: `max_tokens: 8192`.

### Frontend: Staged Loading Placeholder

A new `GeneratingPlaceholder` component renders while `generating === true`. It replaces the article output slot (not the button) and cycles through 3 Gujarati stage labels via `useEffect` + `setTimeout`:

| Window | Label |
|--------|-------|
| 0–6s   | Claude વિચારી રહ્યા છે... |
| 6–14s  | Article ઘડાઈ રહ્યો છે... |
| 14s+   | Supabase માં સાચવી રહ્યા છે... |

Visual: rounded card matching `ArticleOutput` shape — stage label header + 3 `Skeleton.Input` pulse bars (title, subtitle, body). No layout jump when real article appears.

## Files Changed

| File | Change |
|------|--------|
| `app/api/samachar/generate/route.ts` | Switch to tool_use, max_tokens 8192, remove JSON.parse |
| `app/api/samachar/refine/route.ts` | Switch to tool_use + change_summary field, max_tokens 8192 |
| `components/samachar/GeneratingPlaceholder.tsx` | New component — skeleton + stage labels |
| `components/samachar/SamacharTool.tsx` | Render GeneratingPlaceholder when generating |

## Success Criteria

- POST `/api/samachar/generate` returns 200 with full Gujarati article for any category and word count 100–300
- POST `/api/samachar/refine` returns 200 with updated article
- No 500 errors caused by JSON truncation or parse failures
- Mobile user sees stage labels cycling during 15–20s generation
- No layout shift between loading state and article output
