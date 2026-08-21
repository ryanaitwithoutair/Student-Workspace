-- Run this in Supabase: SQL Editor -> New query -> Run.
-- It is idempotent, so it is safe to run again after the initial setup.
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

-- Cap client-controlled payloads. This prevents one authenticated account from
-- turning the JSON workspace record or analytics table into unbounded storage.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'user_workspace_state_size_check'
      and conrelid = 'public.user_workspace_state'::regclass
  ) then
    alter table public.user_workspace_state
      add constraint user_workspace_state_size_check
      check (octet_length(state::text) <= 262144);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'focus_sessions_minutes_range_check'
      and conrelid = 'public.focus_sessions'::regclass
  ) then
    alter table public.focus_sessions
      add constraint focus_sessions_minutes_range_check
      check (minutes between 1 and 1440);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'focus_sessions_id_length_check'
      and conrelid = 'public.focus_sessions'::regclass
  ) then
    alter table public.focus_sessions
      add constraint focus_sessions_id_length_check
      check (char_length(id) between 1 and 128);
  end if;
end;
$$;

-- The database, not the browser clock, owns this audit timestamp.
create or replace function public.set_workspace_state_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_workspace_state_updated_at on public.user_workspace_state;
create trigger set_workspace_state_updated_at
  before insert or update on public.user_workspace_state
  for each row execute function public.set_workspace_state_updated_at();

-- Users may keep at most 5,000 sessions. The trigger is AFTER INSERT so an
-- upsert that updates an existing row is not blocked when the cap is reached.
create or replace function public.enforce_focus_session_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.focus_sessions where user_id = new.user_id) > 5000 then
    raise exception 'Focus session limit reached';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_focus_session_limit on public.focus_sessions;
create trigger enforce_focus_session_limit
  after insert on public.focus_sessions
  for each row execute function public.enforce_focus_session_limit();

alter table public.user_workspace_state enable row level security;
alter table public.focus_sessions enable row level security;

revoke all on public.user_workspace_state from public, anon;
revoke all on public.focus_sessions from public, anon;
grant select, insert, update, delete on public.user_workspace_state to authenticated;
grant select, insert, update, delete on public.focus_sessions to authenticated;

revoke all on function public.set_workspace_state_updated_at() from public;
revoke all on function public.enforce_focus_session_limit() from public;

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
