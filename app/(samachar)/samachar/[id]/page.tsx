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
