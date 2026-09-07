-- ============================================================
-- 역사야 놀자 — 학습 기록 스키마
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.
-- 여러 번 실행해도 안전합니다 (idempotent).
-- ============================================================

-- ------------------------------------------------------------
-- 1) quiz_attempts : 문항 풀이 기록 (append-only)
--    대시보드의 모든 카운터는 이 테이블에서 집계합니다.
-- ------------------------------------------------------------
create table if not exists public.quiz_attempts (
  id            bigint generated always as identity primary key,
  user_id       uuid        not null references auth.users(id) on delete cascade,
  source        text        not null check (source in ('quiz', 'exam')),
  question_id   text        not null,
  is_correct    boolean     not null,
  chosen_index  smallint,
  answered_at   timestamptz not null default now()
);

create index if not exists quiz_attempts_user_time_idx
  on public.quiz_attempts (user_id, answered_at desc);

create index if not exists quiz_attempts_user_source_idx
  on public.quiz_attempts (user_id, source);

-- ------------------------------------------------------------
-- 2) wrong_answers : 오답 노트 (문항당 1행, 틀릴 때마다 누적)
--    맞히면 resolved = true 로 바뀌어 노트에서 빠집니다.
-- ------------------------------------------------------------
create table if not exists public.wrong_answers (
  user_id       uuid        not null references auth.users(id) on delete cascade,
  source        text        not null check (source in ('quiz', 'exam')),
  question_id   text        not null,
  wrong_count   integer     not null default 1,
  last_wrong_at timestamptz not null default now(),
  resolved      boolean     not null default false,
  primary key (user_id, source, question_id)
);

create index if not exists wrong_answers_open_idx
  on public.wrong_answers (user_id, resolved, last_wrong_at desc);

-- ------------------------------------------------------------
-- 3) study_progress : 시대별 학습 완료 표시
-- ------------------------------------------------------------
create table if not exists public.study_progress (
  user_id      uuid        not null references auth.users(id) on delete cascade,
  period       text        not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, period)
);

-- ============================================================
-- RLS — 본인 행만 읽고 쓸 수 있습니다.
-- 이 사이트의 anon key 는 소스에 공개돼 있으므로 RLS 가 유일한 방어선입니다.
-- ============================================================
alter table public.quiz_attempts  enable row level security;
alter table public.wrong_answers  enable row level security;
alter table public.study_progress enable row level security;

-- quiz_attempts
drop policy if exists "own attempts: select" on public.quiz_attempts;
create policy "own attempts: select" on public.quiz_attempts
  for select using (auth.uid() = user_id);

drop policy if exists "own attempts: insert" on public.quiz_attempts;
create policy "own attempts: insert" on public.quiz_attempts
  for insert with check (auth.uid() = user_id);

drop policy if exists "own attempts: delete" on public.quiz_attempts;
create policy "own attempts: delete" on public.quiz_attempts
  for delete using (auth.uid() = user_id);

-- wrong_answers
drop policy if exists "own wrong: select" on public.wrong_answers;
create policy "own wrong: select" on public.wrong_answers
  for select using (auth.uid() = user_id);

drop policy if exists "own wrong: insert" on public.wrong_answers;
create policy "own wrong: insert" on public.wrong_answers
  for insert with check (auth.uid() = user_id);

drop policy if exists "own wrong: update" on public.wrong_answers;
create policy "own wrong: update" on public.wrong_answers
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own wrong: delete" on public.wrong_answers;
create policy "own wrong: delete" on public.wrong_answers
  for delete using (auth.uid() = user_id);

-- study_progress
drop policy if exists "own progress: select" on public.study_progress;
create policy "own progress: select" on public.study_progress
  for select using (auth.uid() = user_id);

drop policy if exists "own progress: insert" on public.study_progress;
create policy "own progress: insert" on public.study_progress
  for insert with check (auth.uid() = user_id);

drop policy if exists "own progress: delete" on public.study_progress;
create policy "own progress: delete" on public.study_progress
  for delete using (auth.uid() = user_id);

-- ============================================================
-- RPC — 오답 카운트 누적 (읽고-쓰기 왕복 없이 원자적으로 처리)
-- security invoker 이므로 위의 RLS 정책이 그대로 적용됩니다.
-- ============================================================
create or replace function public.record_wrong_answer(
  p_source      text,
  p_question_id text
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  insert into public.wrong_answers (user_id, source, question_id)
  values (auth.uid(), p_source, p_question_id)
  on conflict (user_id, source, question_id) do update
    set wrong_count   = public.wrong_answers.wrong_count + 1,
        last_wrong_at = now(),
        resolved      = false;
end;
$$;

-- ============================================================
-- RPC — 대시보드 집계를 한 번의 왕복으로
-- ============================================================
create or replace function public.get_my_stats()
returns table (
  quiz_solved   bigint,
  quiz_correct  bigint,
  exam_solved   bigint,
  exam_correct  bigint,
  wrong_open    bigint
)
language sql
security invoker
set search_path = public
as $$
  select
    count(*) filter (where a.source = 'quiz')                        as quiz_solved,
    count(*) filter (where a.source = 'quiz' and a.is_correct)       as quiz_correct,
    count(*) filter (where a.source = 'exam')                        as exam_solved,
    count(*) filter (where a.source = 'exam' and a.is_correct)       as exam_correct,
    (select count(*) from public.wrong_answers w
      where w.user_id = auth.uid() and not w.resolved)               as wrong_open
  from public.quiz_attempts a
  where a.user_id = auth.uid();
$$;
