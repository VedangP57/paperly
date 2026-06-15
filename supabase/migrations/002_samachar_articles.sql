create table if not exists public.samachar_articles (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null,
  input_data jsonb default '{}',
  headline text,
  subheadline text,
  article_body text,
  word_count int,
  refinement_history jsonb default '[]'
);

create index samachar_articles_user_id_idx on public.samachar_articles(user_id);
create index samachar_articles_created_at_idx on public.samachar_articles(created_at desc);

alter table public.samachar_articles enable row level security;

create policy "Users can manage their own samachar articles"
  on public.samachar_articles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
