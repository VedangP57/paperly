'use client'

import { usePathname } from 'next/navigation'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'

const PAPERLY_PATHS = new Set(['/', '/login', '/signup'])

export type PublicBrand = 'paperly' | 'cliently'

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const brand: PublicBrand = PAPERLY_PATHS.has(pathname) ? 'paperly' : 'cliently'

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar brand={brand} />
      <main className="flex-1">{children}</main>
      <PublicFooter brand={brand} />
    </div>
  )
}
