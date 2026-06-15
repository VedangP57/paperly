import { PublicShell } from '@/components/layout/PublicShell'
import { PostHogProvider } from '@/components/shared/PostHogProvider'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PostHogProvider>
      <PublicShell>{children}</PublicShell>
    </PostHogProvider>
  )
}
