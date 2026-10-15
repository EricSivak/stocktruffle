-- The app speaks English now; the single-user hook's refusal follows. Logic is unchanged.
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
        'message', 'This installation already has an account.'
      )
    );
  end if;
  return '{}'::jsonb;
end;
$$;
