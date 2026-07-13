-- Memoora — Quiz tables migration
-- Run in Supabase SQL Editor (Dashboard → SQL → New query)
--
-- ⚠️ SECURITY NOTE (Production):
-- Bu migration dev/MVP için public insert/select açar.
-- Canlıda quiz_attempts insert rate-limit ve admin CRUD işlemleri
-- server-side auth (service role + API route) ile korunmalıdır.
-- Client-side PIN yalnızca admin UI kapısıdır; RLS tek başına güvenlik sağlamaz.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  question_text text not null,
  option_a text not null,
  option_b text not null,
  option_c text,
  option_d text,
  correct_option text not null check (correct_option in ('A', 'B', 'C', 'D')),
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  participant_name text not null,
  score int not null,
  total_questions int not null,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists quiz_questions_couple_id_idx
  on public.quiz_questions(couple_id);

create index if not exists quiz_questions_sort_idx
  on public.quiz_questions(couple_id, sort_order asc);

create index if not exists quiz_attempts_couple_id_idx
  on public.quiz_attempts(couple_id);

create index if not exists quiz_attempts_leaderboard_idx
  on public.quiz_attempts(couple_id, score desc, created_at asc);

-- ---------------------------------------------------------------------------
-- RLS — development-friendly (MVP)
-- ---------------------------------------------------------------------------

alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;

-- Public: read active questions only
drop policy if exists "quiz_questions_public_read_active" on public.quiz_questions;
create policy "quiz_questions_public_read_active" on public.quiz_questions
  for select using (is_active = true);

-- Dev: admin panel reads all questions (including inactive)
drop policy if exists "quiz_questions_admin_read_all_dev" on public.quiz_questions;
create policy "quiz_questions_admin_read_all_dev" on public.quiz_questions
  for select using (true);

-- Dev: admin insert/update/delete questions from client
drop policy if exists "quiz_questions_admin_write_dev" on public.quiz_questions;
create policy "quiz_questions_admin_write_dev" on public.quiz_questions
  for insert with check (true);

drop policy if exists "quiz_questions_admin_update_dev" on public.quiz_questions;
create policy "quiz_questions_admin_update_dev" on public.quiz_questions
  for update using (true) with check (true);

drop policy if exists "quiz_questions_admin_delete_dev" on public.quiz_questions;
create policy "quiz_questions_admin_delete_dev" on public.quiz_questions
  for delete using (true);

-- Public: read attempts (leaderboard)
drop policy if exists "quiz_attempts_public_read" on public.quiz_attempts;
create policy "quiz_attempts_public_read" on public.quiz_attempts
  for select using (true);

-- Public: insert attempts (guest quiz submission)
drop policy if exists "quiz_attempts_public_insert" on public.quiz_attempts;
create policy "quiz_attempts_public_insert" on public.quiz_attempts
  for insert with check (true);

-- Dev: admin delete attempts (clear results)
drop policy if exists "quiz_attempts_admin_delete_dev" on public.quiz_attempts;
create policy "quiz_attempts_admin_delete_dev" on public.quiz_attempts
  for delete using (true);

-- ---------------------------------------------------------------------------
-- Optional seed: sample question for mert-irem
-- ---------------------------------------------------------------------------

insert into public.quiz_questions (
  couple_id, question_text, option_a, option_b, option_c, option_d,
  correct_option, sort_order, is_active
)
select
  c.id,
  'Mert ve İrem ilk nerede tanıştı?',
  'Karaköy''de bir galeride',
  'Kadıköy''de bir kafede',
  'Zorlu''da bir konserde',
  'Ortak bir arkadaşın yemeğinde',
  'A',
  0,
  true
from public.couples c
where c.slug = 'mert-irem'
  and not exists (
    select 1 from public.quiz_questions q where q.couple_id = c.id
  );
