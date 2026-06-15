# Samachar AI — Claude-Style Chat Layout

## Goal
Replace the current form-page Samachar tool with a Claude-style chat experience: dedicated full-screen layout at `/samachar/`, own sidebar with article history, and a 3-state main area (empty → form → generated).

## Architecture

### Routing
New route group `(samachar)` — completely independent from the existing `(dashboard)` layout:

```
app/
├── (samachar)/
│   ├── layout.tsx              ← auth guard + samachar shell
│   └── samachar/
│       ├── page.tsx            ← redirect to /samachar/new
│       ├── new/page.tsx        ← empty state (category picker)
│       └── [id]/page.tsx       ← article thread
```

Auth: `layout.tsx` calls `createClient()` + `getUser()`, redirects to `/login` if no session. Same pattern as `(dashboard)/layout.tsx`.

The existing dashboard sidebar "Samachar AI" nav item changes its `href` from `/dashboard/samachar` to `/samachar`.

### URL Behaviour
- `/samachar` → redirect to `/samachar/new`
- `/samachar/new` → empty state, `ChatThread` with no article
- `/samachar/[id]` → article thread, `[id]` is the Supabase `samachar_articles` UUID

After generate: `router.push('/samachar/${id}')` fires immediately so the URL reflects the saved article. Browser back goes to `/samachar/new`.

---

## Components

### New Components

**`app/(samachar)/layout.tsx`**
- Server component
- Auth guard (redirect to `/login` if no user)
- Renders: `SamacharSidebar` (left, fixed 260px desktop / drawer mobile) + `<main>` (flex-1, scrollable)
- Passes `user` to `SamacharSidebar`

**`components/samachar/SamacharSidebar.tsx`**
- Client component
- Top: "Paperly" brand text (links to `/dashboard`)
- Button: `+ નવો સમાચાર` → navigates to `/samachar/new`
- Section: `ChatHistoryList`
- Bottom: `ThemeToggle` + logout
- Desktop: fixed 260px left panel
- Mobile: hidden; opened as Sheet drawer via hamburger in top bar

**`components/samachar/ChatHistoryList.tsx`**
- Client component
- Fetches `/api/samachar/history` on mount via `useEffect`
- Re-fetches when a `refreshKey` prop (number) changes — `ChatThread` increments it after each successful generate
- Renders list of past articles: truncated `headline` (max 32 chars) + relative date
- Each item links to `/samachar/[id]`
- Active item highlighted (matches `usePathname()`)

**`components/samachar/ChatThread.tsx`**
- Client component — the 3-state machine
- Props: `initialArticle?: Article` (undefined on `/new`, populated on `/[id]`)
- State: `view: 'empty' | 'form' | 'generated'`
  - `initialArticle` present → starts as `'generated'`
  - No article → starts as `'empty'`
- `'empty'`: renders `CategoryPicker` centered on screen with welcome text
- `'form'`: renders category form (`WeatherForm` or `GeneralForm`) + word count slider + Generate button
- `'generated'`: renders `FormSummaryChip` + `ArticleOutput` + `RefinementChat`
- On generate: calls `POST /api/samachar/generate`, on success → `router.push('/samachar/${data.id}')`, sets `view = 'generated'`

**`components/samachar/FormSummaryChip.tsx`**
- Client component
- Props: `category`, `inputData`, `wordCount`, `onReopen: () => void`
- Renders a single-line collapsed summary: `[ {category} · {location or first field} · ~{wordCount} શ. ] [↺ ફરી ભરો]`
- Clicking `↺ ફરી ભરો` calls `onReopen()` which sets `view = 'form'` in `ChatThread`

### Reused (zero changes)
- `CategoryPicker.tsx`
- `GeneralForm.tsx`
- `WeatherForm.tsx`
- `ArticleOutput.tsx`
- `RefinementChat.tsx`
- `VoiceButton.tsx`
- All API routes: `/api/samachar/generate`, `/api/samachar/refine`, `/api/samachar/history`

### Deleted
- `components/samachar/SamacharTool.tsx` — logic fully replaced by `ChatThread.tsx`
- `app/(dashboard)/dashboard/samachar/page.tsx` — replaced by `(samachar)` routes

---

## Layout Shell (Desktop vs Mobile)

### Desktop
```
┌── SamacharSidebar (260px) ──┬── main (flex-1, overflow-y-auto) ──┐
│ Paperly                     │                                     │
│                             │  [ChatThread — one of 3 states]    │
│ + નવો સમાચાર                │                                     │
│                             │                                     │
│ ─ ઇતિહાસ ─                  │                                     │
│ • સુરત વરસાદ ભારે...        │                                     │
│ • ઓલપાડ ખેડૂત...            │                                     │
│                             │                                     │
│ [theme] [logout]            │                                     │
└─────────────────────────────┴─────────────────────────────────────┘
```

### Mobile
- `SamacharSidebar` hidden
- Top bar: `[☰]` · `Paperly` (centered) · `[+ નવો]`
- Hamburger opens `SamacharSidebar` as Sheet drawer (left side)
- No bottom nav bar

---

## 3 States of ChatThread

### `empty`
- `CategoryPicker` grid centered vertically and horizontally
- Small welcome line above: `સમાચારનો પ્રકાર પસંદ કરો`
- Selecting a category → `setView('form')`

### `form`
- Category label shown at top
- `WeatherForm` or `GeneralForm` based on category
- Word count slider below form
- `Generate` button at bottom
- Back arrow → `setView('empty')`, clears category

### `generated`
- `FormSummaryChip` at top (collapsed form)
- `ArticleOutput` (headline, subheadline, body, copy + edit buttons)
- `RefinementChat` below (quick prompts + voice + text input)
- Refinements append in chat; article updates in place

---

## Data Flow

```
/samachar/new
  user picks category
  user fills form
  clicks Generate
    → POST /api/samachar/generate { category, inputData, wordCount }
    → { id, headline, subheadline, article_body, word_count }
    → router.push(`/samachar/${id}`)
    → ChatHistoryList refreshes

/samachar/[id]
  page.tsx (server): fetch article from supabase by id
  pass as initialArticle to ChatThread
  ChatThread starts in 'generated' state
  user sends refinement
    → POST /api/samachar/refine { articleId, message, currentArticle, category }
    → article updates in place
    → refinement_history saved in DB
```

---

## What Does NOT Change
- Supabase schema (`samachar_articles` table, `refinement_history` JSONB)
- API route logic and Anthropic tool_use implementation
- All form components and CategoryPicker
- The existing dashboard and its other pages (clients, projects, etc.)
- Auth system
