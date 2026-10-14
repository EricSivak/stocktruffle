-- Screenshot and click-test runs sign up throwaway accounts ending in @stocktruffle.test and
-- delete them afterwards. Those accounts neither count as the installation's one account nor
-- are they blocked by it, so tests work without touching the real account.
create or replace function public.hook_single_user(event jsonb) returns jsonb
language plpgsql
set search_path = ''
as $$
begin
  if (event -> 'user' ->> 'email') like '%@stocktruffle.test' then
    return '{}'::jsonb;
  end if;
  if exists (select 1 from auth.users where email not like '%@stocktruffle.test') then
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
