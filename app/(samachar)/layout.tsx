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
