-- Samachar AI articles table (dedicated paperly project, no multi-user auth needed)
create table if not exists public.samachar_articles (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  category text not null,
  input_data jsonb default '{}',
  headline text,
  subheadline text,
  article_body text,
  word_count int,
  refinement_history jsonb default '[]'
);

create index if not exists samachar_articles_created_at_idx on public.samachar_articles(created_at desc);

-- Public read/write — service role key is used server-side, no RLS needed
alter table public.samachar_articles enable row level security;

create policy "allow_all" on public.samachar_articles
  for all using (true) with check (true);
