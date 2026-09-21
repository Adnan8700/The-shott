-- Fix: gen_random_bytes lives in the "extensions" schema, not "public"
-- Update all functions to include extensions in search_path and qualify the call

ALTER FUNCTION public.generate_participant_id() SET search_path = public, extensions;
ALTER FUNCTION public.generate_referral_id() SET search_path = public, extensions;
ALTER FUNCTION public.create_participant(text, text, integer, text, text, text, text, text, text) SET search_path = public, extensions;
ALTER FUNCTION public.verify_payment(text, text, text) SET search_path = public, extensions;
ALTER FUNCTION public.approve_instagram_submission(uuid) SET search_path = public, extensions;
ALTER FUNCTION public.reject_instagram_submission(uuid, text) SET search_path = public, extensions;
ALTER FUNCTION public.get_admin_stats() SET search_path = public, extensions;

-- Recreate generate_participant_id with extensions.gen_random_bytes
CREATE OR REPLACE FUNCTION generate_participant_id()
RETURNS text AS $$
DECLARE
  v_new_id text;
  v_exists boolean;
BEGIN
  LOOP
    v_new_id := 'PT-' || upper(substr(encode(extensions.gen_random_bytes(4), 'hex'), 1, 6));
    SELECT EXISTS(SELECT 1 FROM participants p WHERE p.participant_id = v_new_id) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- Recreate generate_referral_id with extensions.gen_random_bytes
CREATE OR REPLACE FUNCTION generate_referral_id()
RETURNS text AS $$
DECLARE
  v_new_id text;
  v_exists boolean;
BEGIN
  LOOP
    v_new_id := 'SHOT-' || upper(substr(encode(extensions.gen_random_bytes(3), 'hex'), 1, 6));
    SELECT EXISTS(SELECT 1 FROM participants p WHERE p.referral_id = v_new_id) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;