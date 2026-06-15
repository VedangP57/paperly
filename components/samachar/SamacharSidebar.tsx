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
