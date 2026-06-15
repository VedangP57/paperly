# Samachar Claude-Style Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing form-page Samachar tool with a Claude-style chat layout: dedicated full-screen route at `/samachar/`, own sidebar with article history, and a 3-state main area (empty → form → generated).

**Architecture:** New `(samachar)` route group with its own layout (auth guard + sidebar + main). Four new components (`SamacharSidebar`, `ChatHistoryList`, `ChatThread`, `FormSummaryChip`). All existing API routes, form components, and CategoryPicker reused unchanged.

**Tech Stack:** Next.js 15 App Router (server + client components), TypeScript, Supabase `@supabase/ssr`, Ant Design v6, Tailwind CSS v4, `lucide-react`

---

## File Map

**Create:**
- `app/(samachar)/layout.tsx` — auth guard + samachar shell
- `app/(samachar)/samachar/page.tsx` — redirect to /samachar/new
- `app/(samachar)/samachar/new/page.tsx` — empty state
- `app/(samachar)/samachar/[id]/page.tsx` — article thread
- `components/samachar/SamacharSidebar.tsx` — logo, new chat btn, history, theme, logout
- `components/samachar/ChatHistoryList.tsx` — fetches history, nav links, active highlight
- `components/samachar/ChatThread.tsx` — 3-state machine (empty / form / generated)
- `components/samachar/FormSummaryChip.tsx` — collapsed form chip after generate

**Modify:**
- `components/layout/Sidebar.tsx:75` — samachar href `/dashboard/samachar` → `/samachar`
- `components/layout/MobileSidebar.tsx:50` — same href change

**Delete:**
- `app/(dashboard)/dashboard/samachar/page.tsx`
- `components/samachar/SamacharTool.tsx`

**Reused unchanged:**
- `components/samachar/CategoryPicker.tsx`, `GeneralForm.tsx`, `WeatherForm.tsx`
- `components/samachar/ArticleOutput.tsx`, `RefinementChat.tsx`, `VoiceButton.tsx`
- `components/samachar/GeneratingPlaceholder.tsx`
- `app/api/samachar/generate/route.ts`, `refine/route.ts`, `history/route.ts`

---

## Task 1: FormSummaryChip

Collapsed one-line summary of the form after an article has been generated. Renders category name, first filled field value (truncated), word count, and a "ફરી ભરો" reopen button.

**Files:**
- Create: `components/samachar/FormSummaryChip.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/samachar/FormSummaryChip.tsx
'use client'

import { RotateCcw } from 'lucide-react'

interface Props {
  category: string
  inputData: Record<string, string>
  wordCount: number
  onReopen: () => void
}

export function FormSummaryChip({ category, inputData, wordCount, onReopen }: Props) {
  const firstValue = Object.values(inputData).find((v) => v?.trim()) ?? ''
  const preview = firstValue.slice(0, 28) + (firstValue.length > 28 ? '...' : '')

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f5f5f5] dark:bg-white/5 rounded-xl border border-[#e6e6e6] dark:border-white/10 text-sm">
      <span className="font-semibold text-[#18181b] dark:text-white shrink-0">{category}</span>
      {preview && (
        <>
          <span className="text-muted-foreground shrink-0">·</span>
          <span className="text-muted-foreground truncate">{preview}</span>
        </>
      )}
      <span className="text-muted-foreground shrink-0">·</span>
      <span className="text-muted-foreground shrink-0">~{wordCount} શ.</span>
      <button
        type="button"
        onClick={onReopen}
        className="ml-auto flex items-center gap-1 text-[#5b5fc7] hover:underline text-xs cursor-pointer shrink-0"
      >
        <RotateCcw className="h-3 w-3" />
        ફરી ભરો
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no output (zero errors)

- [ ] **Step 3: Commit**

```bash
git add components/samachar/FormSummaryChip.tsx
git commit -m "feat(samachar): add FormSummaryChip collapsed form summary"
```

---

## Task 2: ChatHistoryList

Fetches article history from `/api/samachar/history`, renders nav links titled by headline, highlights the active route. Re-fetches whenever the pathname changes (catches new article navigations automatically).

**Files:**
- Create: `components/samachar/ChatHistoryList.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/samachar/ChatHistoryList.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface HistoryItem {
  id: string
  headline: string
  created_at: string
  category: string
}

export function ChatHistoryList() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/samachar/history')
      .then((r) => r.json())
      .then(setItems)
      .catch(() => {})
  }, [pathname])  // re-fetch on every route change — catches new articles

  if (items.length === 0) {
    return (
      <p className="px-2 py-3 text-xs text-muted-foreground">
        હજી કોઈ સમાચાર નથી
      </p>
    )
  }

  return (
    <div className="space-y-0.5 py-1">
      {items.map((item) => {
        const isActive = pathname === `/samachar/${item.id}`
        const title = item.headline?.slice(0, 34) + (item.headline?.length > 34 ? '...' : '')
        return (
          <Link
            key={item.id}
            href={`/samachar/${item.id}`}
            className={`block px-2 py-2 rounded-lg text-sm transition-colors no-underline ${
              isActive
                ? 'bg-[#5b5fc7]/15 dark:bg-[#5b5fc7]/20 text-[#5b5fc7] font-medium'
                : 'text-[#374151] dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <span className="block truncate leading-snug">{title || 'Untitled'}</span>
            <span className="text-[11px] text-muted-foreground">{item.category}</span>
          </Link>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no output

- [ ] **Step 3: Commit**

```bash
git add components/samachar/ChatHistoryList.tsx
git commit -m "feat(samachar): add ChatHistoryList with pathname-driven refresh"
```

---

## Task 3: SamacharSidebar

Desktop: fixed 260px left panel. Mobile: hidden; a fixed `h-14` top bar is shown instead with hamburger that opens the sidebar content as a Sheet drawer. The layout `<main>` needs `pt-14 lg:pt-0` to clear the mobile top bar.

**Files:**
- Create: `components/samachar/SamacharSidebar.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/samachar/SamacharSidebar.tsx
'use client'

import Link from 'next/link'
import { PlusCircle, LogOut, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { ChatHistoryList } from './ChatHistoryList'
import { logoutAction } from '@/lib/actions/auth'

interface Props {
  userEmail: string
}

function SidebarContent({ userEmail }: Props) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111]">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-[#e0e0e0] dark:border-white/10 shrink-0">
        <Link
          href="/dashboard"
          className="text-xl font-bold !text-black dark:!text-white no-underline"
        >
          Paperly
        </Link>
      </div>

      {/* New Chat */}
      <div className="px-3 py-3 shrink-0">
        <Link
          href="/samachar/new"
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-[#e0e0e0] dark:border-white/10 text-sm font-medium text-[#18181b] dark:text-white hover:bg-[#f5f5f5] dark:hover:bg-white/5 transition-colors no-underline"
        >
          <PlusCircle className="h-4 w-4 shrink-0" />
          નવો સમાચાર
        </Link>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto px-2 min-h-0">
        <p className="px-2 pt-1 pb-0.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          ઇતિહાસ
        </p>
        <ChatHistoryList />
      </div>

      {/* Bottom */}
      <div className="shrink-0 border-t border-[#e0e0e0] dark:border-white/10 px-4 py-3 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground truncate">{userEmail}</span>
        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle />
          <form action={logoutAction}>
            <button
              type="submit"
              className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground cursor-pointer"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export function SamacharSidebar({ userEmail }: Props) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-[#e0e0e0] dark:border-white/10 h-screen sticky top-0">
        <SidebarContent userEmail={userEmail} />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex h-14 items-center gap-3 border-b border-[#e0e0e0] dark:border-white/10 bg-white dark:bg-[#111] px-4">
        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarContent userEmail={userEmail} />
          </SheetContent>
        </Sheet>

        <span className="flex-1 text-center text-xl font-bold text-black dark:text-white">
          Paperly
        </span>

        <Link
          href="/samachar/new"
          className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-[#18181b] dark:text-white"
          aria-label="New article"
        >
          <PlusCircle className="h-5 w-5" />
        </Link>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no output

- [ ] **Step 3: Commit**

```bash
git add components/samachar/SamacharSidebar.tsx
git commit -m "feat(samachar): add SamacharSidebar with desktop + mobile layouts"
```

---

## Task 4: (samachar) Layout + Redirect Page

Auth guard server component. Renders `SamacharSidebar` + `<main>`. On mobile the main needs top padding to clear the fixed top bar.

**Files:**
- Create: `app/(samachar)/layout.tsx`
- Create: `app/(samachar)/samachar/page.tsx`

- [ ] **Step 1: Create the layout**

```tsx
// app/(samachar)/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SamacharSidebar } from '@/components/samachar/SamacharSidebar'

export const dynamic = 'force-dynamic'

export default async function SamacharLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="flex h-screen bg-[#f0f0f0] dark:bg-[#0a0a0a]">
      <SamacharSidebar userEmail={user.email ?? ''} />
      <main className="flex-1 overflow-y-auto min-w-0 pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Create the redirect page**

```tsx
// app/(samachar)/samachar/page.tsx
import { redirect } from 'next/navigation'

export default function SamacharIndexPage() {
  redirect('/samachar/new')
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no output

- [ ] **Step 4: Commit**

```bash
git add app/\(samachar\)/layout.tsx app/\(samachar\)/samachar/page.tsx
git commit -m "feat(samachar): add route group layout with auth guard"
```

---

## Task 5: ChatThread (3-State Machine)

Client component that owns the `view` state (`'empty' | 'form' | 'generated'`). When `initialArticle` is provided (visiting `/samachar/[id]`), starts in `'generated'`. On generate success, calls `router.push('/samachar/${data.id}')` so URL updates and history refreshes.

**Files:**
- Create: `components/samachar/ChatThread.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/samachar/ChatThread.tsx
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
}

export function ChatThread({ initialArticle, initialCategory }: Props) {
  const router = useRouter()
  const { notification } = App.useApp()

  const [view, setView] = useState<'empty' | 'form' | 'generated'>(
    initialArticle ? 'generated' : 'empty'
  )
  const [category, setCategory] = useState<Category | null>(
    (initialCategory as Category) ?? null
  )
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [wordCount, setWordCount] = useState(200)
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
              Article ની લંબાઈ: ~{wordCount} શબ્દ
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no output

- [ ] **Step 3: Commit**

```bash
git add components/samachar/ChatThread.tsx
git commit -m "feat(samachar): add ChatThread 3-state machine (empty/form/generated)"
```

---

## Task 6: New and [id] Pages

`/samachar/new` renders `ChatThread` with no initial article (empty state). `/samachar/[id]` fetches the article server-side by UUID and passes it to `ChatThread` (starts in generated state). `params` must be awaited in Next.js 15.

**Files:**
- Create: `app/(samachar)/samachar/new/page.tsx`
- Create: `app/(samachar)/samachar/[id]/page.tsx`

- [ ] **Step 1: Create /samachar/new page**

```tsx
// app/(samachar)/samachar/new/page.tsx
import { ChatThread } from '@/components/samachar/ChatThread'

export default function NewSamacharPage() {
  return <ChatThread />
}
```

- [ ] **Step 2: Create /samachar/[id] page**

```tsx
// app/(samachar)/samachar/[id]/page.tsx
import { notFound } from 'next/navigation'
import { createSamacharClient } from '@/lib/supabase/samachar'
import { ChatThread } from '@/components/samachar/ChatThread'

export const dynamic = 'force-dynamic'

export default async function SamacharChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createSamacharClient()
  const { data: article } = await supabase
    .from('samachar_articles')
    .select('id, headline, subheadline, article_body, word_count, category, input_data')
    .eq('id', id)
    .single()

  if (!article) notFound()

  return (
    <ChatThread
      initialArticle={{
        id: article.id,
        headline: article.headline,
        subheadline: article.subheadline,
        article_body: article.article_body,
        word_count: article.word_count,
      }}
      initialCategory={article.category as string}
    />
  )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no output

- [ ] **Step 4: Commit**

```bash
git add "app/(samachar)/samachar/new/page.tsx" "app/(samachar)/samachar/[id]/page.tsx"
git commit -m "feat(samachar): add /samachar/new and /samachar/[id] pages"
```

---

## Task 7: Update Dashboard Sidebar Links + Delete Old Files

Update both `Sidebar.tsx` and `MobileSidebar.tsx` to point Samachar AI to `/samachar`. Then delete the now-replaced files.

**Files:**
- Modify: `components/layout/Sidebar.tsx:75`
- Modify: `components/layout/MobileSidebar.tsx:50`
- Delete: `app/(dashboard)/dashboard/samachar/page.tsx`
- Delete: `components/samachar/SamacharTool.tsx`

- [ ] **Step 1: Update Sidebar.tsx samachar href**

In `components/layout/Sidebar.tsx` at line 75, change:
```ts
{ label: 'Samachar AI', href: '/dashboard/samachar', icon: Newspaper },
```
to:
```ts
{ label: 'Samachar AI', href: '/samachar', icon: Newspaper },
```

- [ ] **Step 2: Update MobileSidebar.tsx samachar href**

In `components/layout/MobileSidebar.tsx` at line 50, change:
```ts
{ label: 'Samachar AI', href: '/dashboard/samachar', icon: Newspaper },
```
to:
```ts
{ label: 'Samachar AI', href: '/samachar', icon: Newspaper },
```

- [ ] **Step 3: Delete old files**

```bash
rm "app/(dashboard)/dashboard/samachar/page.tsx"
rm "components/samachar/SamacharTool.tsx"
```

- [ ] **Step 4: Verify TypeScript (no broken imports)**

```bash
npx tsc --noEmit 2>&1 | head -30
```
Expected: no output. If there are errors about missing `SamacharTool`, grep for any remaining imports and remove them.

```bash
grep -r "SamacharTool\|dashboard/samachar" app components --include="*.tsx" --include="*.ts"
```
Expected: no matches

- [ ] **Step 5: Commit**

```bash
git add components/layout/Sidebar.tsx components/layout/MobileSidebar.tsx
git commit -m "feat(samachar): update sidebar links to /samachar, remove old page and SamacharTool"
```

---

## Task 8: Smoke Test

Manually verify the full flow works end-to-end in the browser.

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify routes**

| Action | Expected |
|---|---|
| Visit `/samachar` | Redirects to `/samachar/new` |
| `/samachar/new` | Sidebar + category picker centered |
| Click a category | Form appears with back arrow |
| Click back arrow | Returns to category picker |
| Fill form + Generate | Loading placeholder → article → URL becomes `/samachar/[uuid]` |
| Sidebar history | New article headline appears |
| Click history item | Article loads in generated state |
| Refine article | Article updates in place |
| Visit `/dashboard` → click Samachar AI | Navigates to `/samachar/new` |
| Mobile (resize < 1024px) | Top bar visible, hamburger opens sidebar drawer |

- [ ] **Step 3: Final TypeScript check**

```bash
npx tsc --noEmit 2>&1
```
Expected: no output

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(samachar): complete Claude-style chat layout"
```
