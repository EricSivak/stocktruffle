-- One profile row per user: standing screening rules ("Meine Regeln") and app settings.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  rules jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Own profile is readable" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "Own profile is updatable" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- The profile is created together with the auth user.
create function public.handle_new_user() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- stocktruffle is a single-user installation: the first sign-up creates the account, every
-- later one is rejected. Wired up as the Auth "before user created" hook in config.toml.
create function public.hook_single_user(event jsonb) returns jsonb
language plpgsql
set search_path = ''
as $$
begin
  if exists (select 1 from auth.users) then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Diese Installation hat bereits ein Konto.'
      )
    );
  end if;
  return '{}'::jsonb;
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.hook_single_user(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_single_user(jsonb) from authenticated, anon, public;
