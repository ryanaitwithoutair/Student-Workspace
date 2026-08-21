-- Run this once in Supabase: SQL Editor -> New query -> Run.
-- Every policy is scoped to auth.uid(), so each signed-in user can only
-- access their own workspace and focus history.

create table if not exists public.user_workspace_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.focus_sessions (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  minutes integer not null check (minutes > 0),
  session_date date not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists focus_sessions_user_date_idx
  on public.focus_sessions (user_id, session_date desc);

alter table public.user_workspace_state enable row level security;
alter table public.focus_sessions enable row level security;

grant select, insert, update, delete on public.user_workspace_state to authenticated;
grant select, insert, update, delete on public.focus_sessions to authenticated;

drop policy if exists "Users manage their workspace state" on public.user_workspace_state;
create policy "Users manage their workspace state"
  on public.user_workspace_state for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage their focus sessions" on public.focus_sessions;
create policy "Users manage their focus sessions"
  on public.focus_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
