-- TaskKitty schema. Run manually in the Supabase SQL editor.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  cat_choice text not null default 'mikan' check (cat_choice in ('mikan','kuro','latte')),
  display_name text,
  created_at timestamptz not null default now()
);

alter table profiles add column if not exists display_name text;

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  done_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on tasks(user_id);

-- Auto-create a profile row when a new user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Base table privileges. RLS policies below only restrict access on top of
-- these — without the GRANTs, authenticated/anon have zero access regardless
-- of policies.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select, update on public.profiles to authenticated;

-- RLS: users only see/modify their own rows.
alter table profiles enable row level security;
alter table tasks enable row level security;


drop policy if exists "profiles: select own" on profiles;
create policy "profiles: select own" on profiles for select using (auth.uid() = id);
drop policy if exists "profiles: update own" on profiles;
create policy "profiles: update own" on profiles for update using (auth.uid() = id);

drop policy if exists "tasks: select own" on tasks;
create policy "tasks: select own" on tasks for select using (auth.uid() = user_id);
drop policy if exists "tasks: insert own" on tasks;
create policy "tasks: insert own" on tasks for insert with check (auth.uid() = user_id);
drop policy if exists "tasks: update own" on tasks;
create policy "tasks: update own" on tasks for update using (auth.uid() = user_id);
drop policy if exists "tasks: delete own" on tasks;
create policy "tasks: delete own" on tasks for delete using (auth.uid() = user_id);

-- Realtime for tasks. FULL replica identity is required so DELETE/UPDATE
-- events carry the full old row (including user_id) — otherwise Realtime's
-- RLS check and user_id filter can't match deleted rows and silently drop
-- the event.
alter table tasks replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tasks'
  ) then
    alter publication supabase_realtime add table tasks;
  end if;
end $$;
