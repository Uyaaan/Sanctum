-- 0005_security_hardening.sql
-- Lock down search_path on functions; revoke EXECUTE on handle_new_user from public.
-- Addresses Supabase advisors:
--   - function_search_path_mutable (set_updated_at, current_streak)
--   - anon_security_definer_function_executable (handle_new_user)
--   - authenticated_security_definer_function_executable (handle_new_user)

-- Pin search_path on shared trigger helper
ALTER FUNCTION public.set_updated_at()
  SET search_path = public, pg_catalog;

-- Pin search_path on streak function
ALTER FUNCTION public.current_streak(uuid, date)
  SET search_path = public, pg_catalog;

-- handle_new_user is meant to fire ONLY from the auth.users insert trigger.
-- Revoke EXECUTE so it can't be called as an RPC by anon/authenticated.
-- The trigger itself still works because triggers don't go through the REST RPC layer.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- Skipped advisors (intentional, low-impact for v0.1):
--   - extension_in_public (pg_trgm): moving an installed extension is intrusive; revisit v0.2
--   - auth_leaked_password_protection: we use magic-link only, not password auth
