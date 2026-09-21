-- FIX 1: Add SELECT policy on admin_users so the anon-key client can read rows for login
-- (RLS was enabled but no policies existed, so all queries returned empty)
DROP POLICY IF EXISTS "anon_select_admin_users" ON admin_users;
CREATE POLICY "anon_select_admin_users" ON admin_users FOR SELECT
  TO anon, authenticated USING (true);

-- FIX 2: Set search_path on all SECURITY DEFINER functions (security best practice + fixes ambiguity)
ALTER FUNCTION public.create_participant(text, text, integer, text, text, text, text, text, text) SET search_path = public;
ALTER FUNCTION public.generate_participant_id() SET search_path = public;
ALTER FUNCTION public.generate_referral_id() SET search_path = public;
ALTER FUNCTION public.verify_payment(text, text, text) SET search_path = public;
ALTER FUNCTION public.approve_instagram_submission(uuid) SET search_path = public;
ALTER FUNCTION public.reject_instagram_submission(uuid, text) SET search_path = public;
ALTER FUNCTION public.get_admin_stats() SET search_path = public;

-- FIX 3: Recreate create_participant with fully-qualified column names to fix "column reference is ambiguous" error
CREATE OR REPLACE FUNCTION create_participant(
  p_full_name text,
  p_email text,
  p_age integer,
  p_gender text,
  p_phone text,
  p_address text,
  p_city text,
  p_instagram_username text,
  p_referred_by_referral_id text DEFAULT NULL
)
RETURNS TABLE (
  participant_id text,
  referral_id text,
  email text,
  full_name text
) AS $$
DECLARE
  v_participant_id text;
  v_referral_id text;
  v_self_referral boolean := false;
  v_duplicate boolean := false;
  v_parent_exists boolean := false;
BEGIN
  -- Check if referral ID belongs to same email (self-referral prevention)
  IF p_referred_by_referral_id IS NOT NULL THEN
    SELECT EXISTS(SELECT 1 FROM participants p WHERE p.referral_id = p_referred_by_referral_id AND p.email = p_email) INTO v_self_referral;
    SELECT EXISTS(SELECT 1 FROM participants p WHERE p.referral_id = p_referred_by_referral_id) INTO v_parent_exists;
  END IF;

  -- Check duplicate (same email already registered)
  SELECT EXISTS(SELECT 1 FROM participants p WHERE p.email = p_email) INTO v_duplicate;

  v_participant_id := public.generate_participant_id();
  v_referral_id := public.generate_referral_id();

  INSERT INTO participants (
    participant_id, full_name, email, age, gender, phone, address, city,
    instagram_username, referral_id, referred_by_referral_id,
    payment_status, shot_status
  ) VALUES (
    v_participant_id, p_full_name, p_email, p_age, p_gender, p_phone, p_address, p_city,
    p_instagram_username, v_referral_id, p_referred_by_referral_id,
    'pending', 'pending'
  );

  -- Create referral record if referred by someone
  IF p_referred_by_referral_id IS NOT NULL AND v_parent_exists AND NOT v_self_referral THEN
    INSERT INTO referrals (parent_referral_id, child_participant_id, child_referral_id, is_self_referral, is_duplicate)
    VALUES (
      p_referred_by_referral_id,
      (SELECT id FROM participants p WHERE p.referral_id = v_referral_id),
      v_referral_id,
      false,
      v_duplicate
    );
  END IF;

  -- Log activity
  INSERT INTO activity_log (event_type, city, message)
  VALUES ('registration', p_city, CONCAT('Someone from ', COALESCE(p_city, 'India'), ' just took THE SHOT.'));

  RETURN QUERY
  SELECT v_participant_id, v_referral_id, p_email, p_full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- FIX 4: Recreate generate_participant_id with non-conflicting variable names
CREATE OR REPLACE FUNCTION generate_participant_id()
RETURNS text AS $$
DECLARE
  v_new_id text;
  v_exists boolean;
BEGIN
  LOOP
    v_new_id := 'PT-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
    SELECT EXISTS(SELECT 1 FROM participants p WHERE p.participant_id = v_new_id) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- FIX 5: Recreate generate_referral_id with non-conflicting variable names
CREATE OR REPLACE FUNCTION generate_referral_id()
RETURNS text AS $$
DECLARE
  v_new_id text;
  v_exists boolean;
BEGIN
  LOOP
    v_new_id := 'SHOT-' || upper(substr(encode(gen_random_bytes(3), 'hex'), 1, 6));
    SELECT EXISTS(SELECT 1 FROM participants p WHERE p.referral_id = v_new_id) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- FIX 6: Recreate verify_payment with qualified column names
CREATE OR REPLACE FUNCTION verify_payment(
  p_participant_id text,
  p_payment_reference text,
  p_payment_amount text
)
RETURNS TABLE (
  referral_id text,
  full_name text,
  email text,
  participant_id text,
  referred_by_referral_id text
) AS $$
DECLARE
  v_referral_id text;
  v_full_name text;
  v_email text;
  v_referred_by text;
  v_parent_referral_id text;
  v_valid_referrals integer;
BEGIN
  -- Update participant payment status
  UPDATE participants
  SET payment_status = 'paid',
      payment_verified = true,
      payment_reference = p_payment_reference,
      payment_amount = p_payment_amount,
      updated_at = now()
  WHERE participant_id = p_participant_id
  RETURNING referral_id, full_name, email, referred_by_referral_id
  INTO v_referral_id, v_full_name, v_email, v_referred_by;

  IF v_referral_id IS NULL THEN
    RAISE EXCEPTION 'Participant not found: %', p_participant_id;
  END IF;

  -- Mark referral as valid (payment verified)
  UPDATE referrals
  SET payment_verified = true,
      is_valid = true,
      validated_at = now()
  WHERE child_referral_id = v_referral_id;

  -- Increment parent's valid referral count
  IF v_referred_by IS NOT NULL THEN
    UPDATE participants
    SET valid_referral_count = valid_referral_count + 1,
        referral_count = referral_count + 1,
        updated_at = now()
    WHERE referral_id = v_referred_by;

    -- Check if parent reached requirement (referral goal complete, not a lock)
    UPDATE participants
    SET shot_status = CASE
      WHEN valid_referral_count >= 2 AND instagram_status = 'approved' THEN 'confirmed'
      WHEN valid_referral_count >= 2 THEN 'unlocked'
      ELSE shot_status
    END,
    updated_at = now()
    WHERE referral_id = v_referred_by AND valid_referral_count >= 2;

    -- Log activity
    INSERT INTO activity_log (event_type, message)
    VALUES ('referral', CONCAT('Someone just completed their referral goal.'));
  END IF;

  -- Log payment activity
  INSERT INTO activity_log (event_type, message)
  VALUES ('payment', CONCAT('Someone just joined THE SHOT.'));

  RETURN QUERY
  SELECT v_referral_id, v_full_name, v_email, p_participant_id, v_referred_by;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- FIX 7: Recreate approve_instagram_submission with qualified names
CREATE OR REPLACE FUNCTION approve_instagram_submission(
  p_submission_id uuid
)
RETURNS void AS $$
DECLARE
  v_participant_id uuid;
  v_valid_referrals integer;
BEGIN
  UPDATE instagram_submissions
  SET status = 'approved', reviewed_at = now()
  WHERE id = p_submission_id
  RETURNING participant_id INTO v_participant_id;

  IF v_participant_id IS NOT NULL THEN
    UPDATE participants
    SET instagram_status = 'approved', updated_at = now()
    WHERE id = v_participant_id;

    SELECT valid_referral_count INTO v_valid_referrals
    FROM participants WHERE id = v_participant_id;

    IF v_valid_referrals >= 2 THEN
      UPDATE participants SET shot_status = 'confirmed', updated_at = now()
      WHERE id = v_participant_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- FIX 8: Recreate reject_instagram_submission with qualified names
CREATE OR REPLACE FUNCTION reject_instagram_submission(
  p_submission_id uuid,
  p_notes text
)
RETURNS void AS $$
BEGIN
  UPDATE instagram_submissions
  SET status = 'rejected', reviewed_at = now(), admin_notes = p_notes
  WHERE id = p_submission_id;

  UPDATE participants
  SET instagram_status = 'rejected', updated_at = now()
  WHERE id = (SELECT participant_id FROM instagram_submissions WHERE id = p_submission_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- FIX 9: Recreate get_admin_stats with qualified names
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build(
    'total_registrations', (SELECT count(*) FROM participants),
    'paid_registrations', (SELECT count(*) FROM participants WHERE payment_verified = true),
    'confirmed_shots', (SELECT count(*) FROM participants WHERE shot_status = 'confirmed'),
    'pending_shots', (SELECT count(*) FROM participants WHERE shot_status = 'pending'),
    'unlocked_shots', (SELECT count(*) FROM participants WHERE shot_status = 'unlocked'),
    'successful_referrals', (SELECT count(*) FROM referrals WHERE is_valid = true),
    'pending_instagram', (SELECT count(*) FROM instagram_submissions WHERE status = 'pending'),
    'approved_instagram', (SELECT count(*) FROM instagram_submissions WHERE status = 'approved'),
    'rejected_instagram', (SELECT count(*) FROM instagram_submissions WHERE status = 'rejected'),
    'total_revenue', (SELECT count(*) FROM participants WHERE payment_verified = true),
    'daily_registrations', (SELECT count(*) FROM participants WHERE created_at >= current_date),
    'daily_payments', (SELECT count(*) FROM participants WHERE payment_verified = true AND updated_at >= current_date),
    'daily_referrals', (SELECT count(*) FROM referrals WHERE is_valid = true AND validated_at >= current_date),
    'conversion_rate', CASE
      WHEN (SELECT count(*) FROM participants) > 0
      THEN round((SELECT count(*) FROM participants WHERE payment_verified = true)::numeric /
           (SELECT count(*) FROM participants)::numeric * 100, 1)
      ELSE 0
    END
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;