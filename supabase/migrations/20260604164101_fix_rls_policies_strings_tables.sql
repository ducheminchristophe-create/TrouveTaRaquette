
/*
  # Fix RLS security issues on mono_strings and hybrid_strings

  ## Problem
  - INSERT, UPDATE, DELETE policies used `true` as condition, granting unrestricted
    write access to any authenticated user — bypassing the intent of RLS.
  - `anon` role had full table privileges (INSERT, UPDATE, DELETE, etc.) even though
    these are read-only catalog tables.
  - `authenticated` role had full table privileges — write access should never reach
    end users for catalog data.

  ## Changes

  ### Policy fixes
  - Drop the always-true INSERT, UPDATE, DELETE policies on both tables.
  - These tables are catalog/reference data; mutations must only happen via
    the `service_role` (bypasses RLS by design) or direct DB access.
  - Retain the existing public SELECT policy so the app can still read strings.

  ### Grant fixes
  - Revoke INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES from `anon`
    on both tables (keep SELECT for public read).
  - Revoke INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES from `authenticated`
    on both tables (keep SELECT so signed-in users can read the catalog).

  ## Result
  - Public (anon) and authenticated users: SELECT only.
  - Mutations: service_role only.
  - No more always-true RLS policy warnings.
  - GraphQL schema visibility: SELECT is intentional for catalog read access;
    the warnings are acknowledged — if you want to hide the tables from GraphQL
    entirely, revoke SELECT from anon/authenticated (would break the app).
*/

-- ─── Drop always-true write policies on hybrid_strings ───────────────────────

DROP POLICY IF EXISTS "Authenticated users can insert hybrid strings" ON public.hybrid_strings;
DROP POLICY IF EXISTS "Authenticated users can update hybrid strings" ON public.hybrid_strings;
DROP POLICY IF EXISTS "Authenticated users can delete hybrid strings" ON public.hybrid_strings;

-- ─── Drop always-true write policies on mono_strings ─────────────────────────

DROP POLICY IF EXISTS "Authenticated users can insert mono strings" ON public.mono_strings;
DROP POLICY IF EXISTS "Authenticated users can update mono strings" ON public.mono_strings;
DROP POLICY IF EXISTS "Authenticated users can delete mono strings" ON public.mono_strings;

-- ─── Revoke unnecessary privileges from anon ─────────────────────────────────

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES
  ON public.hybrid_strings FROM anon;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES
  ON public.mono_strings FROM anon;

-- ─── Revoke write privileges from authenticated ───────────────────────────────

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES
  ON public.hybrid_strings FROM authenticated;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES
  ON public.mono_strings FROM authenticated;
