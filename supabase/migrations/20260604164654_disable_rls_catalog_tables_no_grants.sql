
/*
  # Disable RLS on catalog tables with no client grants

  ## Context
  `public.hybrid_strings` and `public.mono_strings` are internal catalog tables.
  In previous migrations we:
    - Dropped all INSERT / UPDATE / DELETE policies (always-true, insecure).
    - Revoked ALL privileges from `anon` and `authenticated`.

  ## Problem
  RLS is still enabled on both tables but no policies exist, triggering the
  "RLS Enabled No Policy" security warning. A table with RLS on and zero policies
  denies all access to every role that goes through RLS — but `service_role`
  bypasses RLS entirely, so the lock-down is not actually enforced by RLS.

  ## Fix
  Disable RLS on both tables. Access control is enforced at the privilege level:
  neither `anon` nor `authenticated` hold any privilege on these tables, so
  they cannot read or write regardless of RLS. Only `service_role` and `postgres`
  retain access, which is the intended state for catalog data.
*/

ALTER TABLE public.hybrid_strings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mono_strings   DISABLE ROW LEVEL SECURITY;
