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

-- ---------------------------------------------------------------------------
-- Private two-person party sessions
-- ---------------------------------------------------------------------------
-- There are deliberately no room IDs or join codes. The two trusted Supabase
-- accounts are allow-listed below, and an invite can only be sent while the
-- recipient has a recent in-app presence heartbeat.

create table if not exists public.party_allowed_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);

-- This product is deliberately restricted to a single two-person party.
create or replace function public.enforce_party_allowed_user_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.party_allowed_users) > 2 then
    raise exception 'A private party can contain exactly two approved accounts.';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_party_allowed_user_limit on public.party_allowed_users;
create trigger enforce_party_allowed_user_limit
  after insert on public.party_allowed_users
  for each row execute function public.enforce_party_allowed_user_limit();

create table if not exists public.party_presence (
  user_id uuid primary key references auth.users(id) on delete cascade,
  heartbeat_at timestamptz not null default now()
);

create table if not exists public.party_partnerships (
  user_one_id uuid not null references auth.users(id) on delete cascade,
  user_two_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_one_id, user_two_id),
  constraint party_partnerships_distinct_users_check check (user_one_id <> user_two_id),
  constraint party_partnerships_sorted_users_check check (user_one_id::text < user_two_id::text)
);

create table if not exists public.party_invitations (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  duration_minutes smallint not null check (duration_minutes between 5 and 180),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '2 minutes'),
  responded_at timestamptz,
  constraint party_invitations_distinct_users_check check (sender_id <> recipient_id)
);

create table if not exists public.party_sessions (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null unique references public.party_invitations(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  user_one_id uuid not null references auth.users(id) on delete cascade,
  user_two_id uuid not null references auth.users(id) on delete cascade,
  duration_minutes smallint not null check (duration_minutes between 5 and 180),
  status text not null default 'active' check (status in ('active', 'completed', 'ended')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  constraint party_sessions_distinct_users_check check (user_one_id <> user_two_id),
  constraint party_sessions_sorted_users_check check (user_one_id::text < user_two_id::text)
);

create index if not exists party_invitations_recipient_idx
  on public.party_invitations (recipient_id, created_at desc);
create index if not exists party_invitations_sender_idx
  on public.party_invitations (sender_id, created_at desc);
create index if not exists party_sessions_members_idx
  on public.party_sessions (user_one_id, user_two_id, started_at desc);
create unique index if not exists party_sessions_one_active_pair_idx
  on public.party_sessions (user_one_id, user_two_id)
  where status = 'active';

alter table public.party_allowed_users enable row level security;
alter table public.party_presence enable row level security;
alter table public.party_partnerships enable row level security;
alter table public.party_invitations enable row level security;
alter table public.party_sessions enable row level security;

revoke all on public.party_allowed_users from public, anon, authenticated;
revoke all on public.party_presence from public, anon;
revoke all on public.party_partnerships from public, anon;
revoke all on public.party_invitations from public, anon;
revoke all on public.party_sessions from public, anon;

grant select, insert, update on public.party_presence to authenticated;
grant select on public.party_partnerships to authenticated;
grant select on public.party_invitations to authenticated;
grant select on public.party_sessions to authenticated;

drop policy if exists "Users update only their party presence" on public.party_presence;
create policy "Users update only their party presence"
  on public.party_presence for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Partners can read their partner presence" on public.party_presence;
create policy "Partners can read their partner presence"
  on public.party_presence for select to authenticated
  using (
    (select auth.uid()) = user_id
    or exists (
      select 1
      from public.party_partnerships partnership
      where (partnership.user_one_id = (select auth.uid()) and partnership.user_two_id = party_presence.user_id)
         or (partnership.user_two_id = (select auth.uid()) and partnership.user_one_id = party_presence.user_id)
    )
  );

drop policy if exists "Users can read their party partnership" on public.party_partnerships;
create policy "Users can read their party partnership"
  on public.party_partnerships for select to authenticated
  using ((select auth.uid()) in (user_one_id, user_two_id));

drop policy if exists "Users can read their party invitations" on public.party_invitations;
create policy "Users can read their party invitations"
  on public.party_invitations for select to authenticated
  using ((select auth.uid()) in (sender_id, recipient_id));

drop policy if exists "Users can read their party sessions" on public.party_sessions;
create policy "Users can read their party sessions"
  on public.party_sessions for select to authenticated
  using ((select auth.uid()) in (user_one_id, user_two_id));

-- All invitation writes pass through the functions below. They use an empty
-- search path and explicit schemas so a caller cannot influence their queries.
drop function if exists public.send_party_invite(text, smallint);
create or replace function public.send_party_invite(
  p_recipient_email text,
  p_duration_minutes integer default 25
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sender_id uuid := auth.uid();
  v_recipient_id uuid;
  v_invite_id uuid;
  v_user_one_id uuid;
  v_user_two_id uuid;
  v_error_message constant text := 'Partner cannot be invited right now. Confirm their approved email and that they are online.';
begin
  if v_sender_id is null then
    raise exception 'You must be signed in to send an invitation.';
  end if;

  if p_duration_minutes is null or p_duration_minutes not between 5 and 180 then
    raise exception 'Choose a focus duration between 5 and 180 minutes.';
  end if;

  if p_recipient_email is null or char_length(trim(p_recipient_email)) not between 3 and 254 then
    raise exception using message = v_error_message;
  end if;

  if not exists (select 1 from public.party_allowed_users where user_id = v_sender_id) then
    raise exception 'Party invitations are not configured yet. Add both accounts to party_allowed_users.';
  end if;

  select id into v_recipient_id
  from auth.users
  where lower(email) = lower(trim(p_recipient_email))
  limit 1;

  if v_recipient_id is null
     or v_recipient_id = v_sender_id
     or not exists (select 1 from public.party_allowed_users where user_id = v_recipient_id)
     or not exists (
       select 1 from public.party_presence
       where user_id = v_recipient_id
         and heartbeat_at >= now() - interval '75 seconds'
     ) then
    raise exception using message = v_error_message;
  end if;

  v_user_one_id := case when v_sender_id::text < v_recipient_id::text then v_sender_id else v_recipient_id end;
  v_user_two_id := case when v_sender_id::text < v_recipient_id::text then v_recipient_id else v_sender_id end;

  if exists (
    select 1 from public.party_partnerships
    where (v_sender_id in (user_one_id, user_two_id)
        or v_recipient_id in (user_one_id, user_two_id))
      and not (user_one_id = v_user_one_id and user_two_id = v_user_two_id)
  ) then
    raise exception 'Your party is already paired with a different account.';
  end if;

  update public.party_invitations
  set status = 'expired', responded_at = now()
  where status = 'pending'
    and expires_at <= now()
    and ((sender_id = v_sender_id and recipient_id = v_recipient_id)
      or (sender_id = v_recipient_id and recipient_id = v_sender_id));

  if exists (
    select 1 from public.party_sessions
    where user_one_id = v_user_one_id
      and user_two_id = v_user_two_id
      and status = 'active'
  ) then
    raise exception 'A shared focus session is already active.';
  end if;

  if exists (
    select 1 from public.party_invitations
    where status = 'pending'
      and expires_at > now()
      and ((sender_id = v_sender_id and recipient_id = v_recipient_id)
        or (sender_id = v_recipient_id and recipient_id = v_sender_id))
  ) then
    raise exception 'There is already a pending invitation between you two.';
  end if;

  insert into public.party_invitations (sender_id, recipient_id, duration_minutes)
  values (v_sender_id, v_recipient_id, p_duration_minutes)
  returning id into v_invite_id;

  return v_invite_id;
end;
$$;

create or replace function public.respond_to_party_invite(
  p_invite_id uuid,
  p_accept boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_invite public.party_invitations%rowtype;
  v_session_id uuid;
  v_user_one_id uuid;
  v_user_two_id uuid;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to respond to an invitation.';
  end if;

  if p_accept is null then
    raise exception 'Choose whether to accept or decline the invitation.';
  end if;

  select * into v_invite
  from public.party_invitations
  where id = p_invite_id
    and recipient_id = v_user_id
    and status = 'pending'
  for update;

  if not found or v_invite.expires_at <= now() then
    if found then
      update public.party_invitations set status = 'expired', responded_at = now() where id = p_invite_id;
    end if;
    raise exception 'This invitation is no longer available.';
  end if;

  if not exists (select 1 from public.party_allowed_users where user_id = v_invite.sender_id)
     or not exists (select 1 from public.party_allowed_users where user_id = v_invite.recipient_id) then
    raise exception 'This invitation is no longer available.';
  end if;

  if not p_accept then
    update public.party_invitations
    set status = 'declined', responded_at = now()
    where id = p_invite_id;
    return null;
  end if;

  v_user_one_id := case when v_invite.sender_id::text < v_invite.recipient_id::text then v_invite.sender_id else v_invite.recipient_id end;
  v_user_two_id := case when v_invite.sender_id::text < v_invite.recipient_id::text then v_invite.recipient_id else v_invite.sender_id end;

  if exists (
    select 1 from public.party_sessions
    where user_one_id = v_user_one_id
      and user_two_id = v_user_two_id
      and status = 'active'
  ) then
    raise exception 'A shared focus session is already active.';
  end if;

  if exists (
    select 1 from public.party_partnerships
    where (v_invite.sender_id in (user_one_id, user_two_id)
        or v_invite.recipient_id in (user_one_id, user_two_id))
      and not (user_one_id = v_user_one_id and user_two_id = v_user_two_id)
  ) then
    raise exception 'Your party is already paired with a different account.';
  end if;

  insert into public.party_partnerships (user_one_id, user_two_id)
  values (v_user_one_id, v_user_two_id)
  on conflict (user_one_id, user_two_id) do nothing;

  update public.party_invitations
  set status = 'accepted', responded_at = now()
  where id = p_invite_id;

  insert into public.party_sessions (
    invitation_id, created_by, user_one_id, user_two_id, duration_minutes
  ) values (
    v_invite.id, v_invite.sender_id, v_user_one_id, v_user_two_id, v_invite.duration_minutes
  ) returning id into v_session_id;

  return v_session_id;
end;
$$;

create or replace function public.end_party_session(p_session_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'You must be signed in to end a shared session.';
  end if;

  update public.party_sessions
  set status = 'ended', ended_at = now()
  where id = p_session_id
    and status = 'active'
    and v_user_id in (user_one_id, user_two_id);

  return found;
end;
$$;

create or replace function public.complete_party_session(p_session_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'You must be signed in to complete a shared session.';
  end if;

  update public.party_sessions
  set status = 'completed', ended_at = now()
  where id = p_session_id
    and status = 'active'
    and v_user_id in (user_one_id, user_two_id)
    and started_at + make_interval(mins => duration_minutes::integer) <= now();

  return found;
end;
$$;

-- This exposes only the signed-in user's existing partner. Email lookup stays
-- server-side; the client never gets access to auth.users directly.
create or replace function public.get_party_partner()
returns table (partner_id uuid, partner_email text)
language sql
security definer
set search_path = ''
stable
as $$
  select
    case
      when partnership.user_one_id = auth.uid() then partnership.user_two_id
      else partnership.user_one_id
    end as partner_id,
    partner.email as partner_email
  from public.party_partnerships partnership
  join auth.users partner on partner.id = case
    when partnership.user_one_id = auth.uid() then partnership.user_two_id
    else partnership.user_one_id
  end
  where auth.uid() in (partnership.user_one_id, partnership.user_two_id)
  limit 1;
$$;

revoke all on function public.enforce_party_allowed_user_limit() from public, anon, authenticated;
revoke all on function public.send_party_invite(text, integer) from public, anon, authenticated;
revoke all on function public.respond_to_party_invite(uuid, boolean) from public, anon, authenticated;
revoke all on function public.end_party_session(uuid) from public, anon, authenticated;
revoke all on function public.complete_party_session(uuid) from public, anon, authenticated;
revoke all on function public.get_party_partner() from public, anon, authenticated;
grant execute on function public.send_party_invite(text, integer) to authenticated;
grant execute on function public.respond_to_party_invite(uuid, boolean) to authenticated;
grant execute on function public.end_party_session(uuid) to authenticated;
grant execute on function public.complete_party_session(uuid) to authenticated;
grant execute on function public.get_party_partner() to authenticated;

-- Enables immediate invite/session updates for clients currently in the app.
do $$
begin
  alter publication supabase_realtime add table public.party_presence;
exception when duplicate_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.party_invitations;
exception when duplicate_object then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table public.party_sessions;
exception when duplicate_object then null;
end;
$$;

-- One-time pairing setup: replace both emails, then run this after both of you
-- have signed in at least once. No room code is ever created or displayed.

insert into public.party_allowed_users (user_id)
select id from auth.users
where lower(email) in ('aryan.tamhane.2011@gmail.com', 'vaibhavibadhe123@gmail.com')
on conflict (user_id) do nothing;
