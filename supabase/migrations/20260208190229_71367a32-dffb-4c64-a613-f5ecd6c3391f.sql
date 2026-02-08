-- Fix mosque_admins RLS to avoid auth.users access + infinite recursion

-- 1) Helper: check whether the current user/email already has a pending/approved claim
create or replace function public.can_submit_mosque_claim(
  _mosque_id uuid,
  _user_id uuid,
  _email text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.mosque_admins ma
    where ma.mosque_id = _mosque_id
      and (ma.user_id = _user_id or ma.claimant_email = _email)
      and ma.status in ('pending', 'approved')
  );
$$;

grant execute on function public.can_submit_mosque_claim(uuid, uuid, text) to anon, authenticated;

-- 2) Replace the problematic policies
-- (old ones referenced auth.users and/or self-referenced mosque_admins inside the policy)
drop policy if exists "Authenticated users can submit claims" on public.mosque_admins;
drop policy if exists "Users can view their own admin status" on public.mosque_admins;

-- Users can view their own claims (match by user_id OR JWT email)
create policy "Users can view their own admin status"
on public.mosque_admins
for select
to authenticated
using (
  user_id = auth.uid()
  or claimant_email = (auth.jwt() ->> 'email')
);

-- Authenticated users can submit claims, but only if no pending/approved claim exists
create policy "Authenticated users can submit claims"
on public.mosque_admins
for insert
to authenticated
with check (
  auth.uid() = user_id
  and claimant_email = (auth.jwt() ->> 'email')
  and public.can_submit_mosque_claim(mosque_id, auth.uid(), (auth.jwt() ->> 'email'))
);
