'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { PlusCircle, LogOut, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { ChatHistoryList } from './ChatHistoryList'
import { logoutAction } from '@/lib/actions/auth'
import { SAMACHAR_ACCENT, PAPERLY_BRAND_GUJ } from '@/lib/constants/brand'
import { PaperlyLogo } from '@/components/shared/PaperlyLogo'
import { InstallPWAButton } from '@/components/shared/InstallPWAButton'

interface Props {
  userEmail: string
}

interface SidebarContentProps extends Props {
  onNavigate?: () => void
  logoOnly?: boolean
}

function SidebarContent({ userEmail, onNavigate, logoOnly }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111]">
      {/* Brand */}
      <div className="px-4 pt-2 border-b border-[#e0e0e0] dark:border-white/10 shrink-0">
        <PaperlyLogo href="/dashboard" size="lg" showLabel={!logoOnly} />
      </div>

      {/* New Chat */}
      <div className="px-3 py-3 shrink-0">
        <Link
          href="/samachar/new"
          onClick={onNavigate}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-[#e0e0e0] dark:border-white/10 text-sm font-medium text-[#18181b] dark:text-white hover:bg-[#f5f5f5] dark:hover:bg-white/5 transition-colors no-underline"
        >
          <PlusCircle className="h-4 w-4 shrink-0" style={{ color: SAMACHAR_ACCENT, stroke: SAMACHAR_ACCENT }} />
          નવો સમાચાર
        </Link>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto px-2 min-h-0">
        <p className="px-2 pt-1 pb-0.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          ઇતિહાસ
        </p>
        <ChatHistoryList onItemClick={onNavigate} />
      </div>

      {/* Install PWA */}
      <div className="shrink-0 px-3 pb-1">
        <InstallPWAButton />
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const logoOnly = pathname === '/samachar/new'

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-[#e0e0e0] dark:border-white/10 h-screen sticky top-0">
        <SidebarContent userEmail={userEmail} logoOnly={logoOnly} />
      </aside>

      {/* Mobile top bar */}
      <div className="samachar-mobile-bar lg:hidden fixed top-0 inset-x-0 z-40 flex h-14 items-center gap-3 border-b border-[#e0e0e0] dark:border-white/10 bg-white dark:bg-[#111] px-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
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
            <SidebarContent
              userEmail={userEmail}
              onNavigate={() => setMobileOpen(false)}
              logoOnly={logoOnly}
            />
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 justify-center">
          {logoOnly ? (
            <Link
              href="/dashboard"
              className="samachar-brand-link text-lg font-bold !text-black dark:!text-white no-underline"
            >
              {PAPERLY_BRAND_GUJ}
            </Link>
          ) : (
            <PaperlyLogo
              href="/dashboard"
              size="sm"
              linkClassName="samachar-brand-link"
              labelClassName="!text-black dark:!text-white"
            />
          )}
        </div>

        <button
          type="button"
          onClick={() => router.push('/samachar/new')}
          className="samachar-new-btn p-1.5 rounded-md hover:bg-[#5b5fc7]/10"
          aria-label="New article"
        >
          <PlusCircle className="h-5 w-5" style={{ color: SAMACHAR_ACCENT, stroke: SAMACHAR_ACCENT }} />
        </button>
      </div>
    </>
  )
}
