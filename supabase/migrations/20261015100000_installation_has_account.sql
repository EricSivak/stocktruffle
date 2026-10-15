-- The login page hides "Create account" once the installation's one account exists. It asks
-- before anyone is signed in, so the answer is readable for anon; it reveals nothing beyond
-- yes or no. Throwaway test accounts (@stocktruffle.test) don't count.
create function public.installation_has_account() returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from auth.users where email not like '%@stocktruffle.test'
  );
$$;

revoke execute on function public.installation_has_account() from public;
grant execute on function public.installation_has_account() to anon, authenticated;
