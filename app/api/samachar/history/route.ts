import { NextResponse } from 'next/server'
import { createSamacharClient } from '@/lib/supabase/samachar'

export async function GET() {
  try {
    const supabase = createSamacharClient()
    const { data, error } = await supabase
      .from('samachar_articles')
      .select('id, created_at, category, headline, subheadline, article_body, word_count')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
