
/*
  # Revoke SELECT from anon and authenticated on catalog tables

  ## Problem
  The tables `public.hybrid_strings` and `public.mono_strings` are visible in the
  Supabase GraphQL schema because `anon` and `authenticated` roles have SELECT.
  This exposes internal catalog data to unauthenticated and authenticated users
  via the GraphQL API without any business need.

  ## Analysis
  The frontend reads string data exclusively from bundled CSV files (csvParser.ts).
  Neither `mono_strings` nor `hybrid_strings` is queried via the Supabase client
  anywhere in the application. Revoking SELECT is therefore safe.

  ## Changes
  - Revoke SELECT from `anon` on both tables (removes public GraphQL visibility).
  - Revoke SELECT from `authenticated` on both tables (removes signed-in GraphQL visibility).
  - Drop the now-redundant public SELECT RLS policies (no grants left to apply them to).
*/

-- ─── Revoke SELECT from anon ──────────────────────────────────────────────────

REVOKE SELECT ON public.hybrid_strings FROM anon;
REVOKE SELECT ON public.mono_strings   FROM anon;

-- ─── Revoke SELECT from authenticated ────────────────────────────────────────

REVOKE SELECT ON public.hybrid_strings FROM authenticated;
REVOKE SELECT ON public.mono_strings   FROM authenticated;

-- ─── Drop the now-redundant public read RLS policies ─────────────────────────

DROP POLICY IF EXISTS "Public read access for hybrid strings" ON public.hybrid_strings;
DROP POLICY IF EXISTS "Public read access for mono strings"   ON public.mono_strings;
