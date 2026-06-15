import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { SamacharTool } from '@/components/samachar/SamacharTool'

export const dynamic = 'force-dynamic'

export default async function SamacharPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: history } = await supabase
    .from('samachar_articles')
    .select('id, created_at, category, headline, subheadline, article_body, word_count')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] lg:h-screen -mb-20 lg:-mb-6 overflow-hidden bg-[#f0f0f0] dark:bg-[#0a0a0a]">
      <div className="shrink-0 px-5 pb-2 pt-3">
        <PageHeader
          title="ગુજરાત સમાચાર — AI સહાયક"
          description="ગુજરાતી પત્રકારત્વ tool — category પસંદ કરો, facts ભરો, AI સમાચાર લખશે"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <SamacharTool initialHistory={history ?? []} />
      </div>
    </div>
  )
}
