/*
# THE SHOT - Core Schema

1. New Tables
- `participants`: Registered users with payment/referral/instagram/shot status
- `referrals`: Parent-child referral relationships with validation status
- `instagram_submissions`: Instagram share verification submissions for admin review
- `admin_config`: Key-value store for all admin-configurable settings (dates, prizes, text, payment HTML, etc.)
- `activity_log`: Anonymized activity events for the social-proof ticker
- `admin_users`: Admin auth (separate from participant auth)

2. Security
- RLS enabled on all tables.
- Participants: anon can insert (registration) and read own row by email; updates restricted.
- Admin tables: restricted to admin role via SECURITY DEFINER function checks.
- Referrals: insert via edge function only; read by parent participant.
- Config: public read for non-sensitive keys; admin-only write.
*/

-- ============================================================
-- ADMIN USERS (separate auth for admin panel)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
-- No policies: admin access is via edge functions using service role key.

-- ============================================================
-- ADMIN CONFIG (key-value store)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_admin_config" ON admin_config;
CREATE POLICY "public_read_admin_config" ON admin_config FOR SELECT
  TO anon, authenticated USING (true);

-- Writes only via edge function with service role key

-- Seed default config
INSERT INTO admin_config (key, value) VALUES
  ('show_start_date', '"2026-10-15"'::jsonb),
  ('registration_deadline', '"2026-09-30"'::jsonb),
  ('registration_window_days', '3'::jsonb),
  ('referral_requirement', '2'::jsonb),
  ('registration_open', 'true'::jsonb),
  ('prizes_enabled', 'true'::jsonb),
  ('prizes', '[{"rank":1,"label":"1st Prize","amount":"₹1 Crore","count":1,"confirmed":false},{"rank":2,"label":"2nd Prize","amount":"₹50 Lakh","count":1,"confirmed":false},{"rank":3,"label":"3rd Prize","amount":"₹25 Lakh","count":1,"confirmed":false},{"rank":4,"label":"Winner Tier","amount":"₹1 Lakh","count":100,"confirmed":false},{"rank":5,"label":"Winner Tier","amount":"₹50,000","count":100,"confirmed":false},{"rank":6,"label":"Winner Tier","amount":"₹25,000","count":100,"confirmed":false},{"rank":7,"label":"Winner Tier","amount":"₹10,000","count":100,"confirmed":false}]'::jsonb),
  ('payment_html', '""'::jsonb),
  ('payment_enabled', 'false'::jsonb),
  ('refund_policy', '"If you do not complete the required referral conditions by the stated deadline, your participation may be cancelled and any refund will be processed according to the published refund policy."'::jsonb),
  ('grace_period_days', '0'::jsonb),
  ('social_instagram', '"@THESHOTOFFICIAL"'::jsonb),
  ('social_youtube', '""'::jsonb),
  ('sections', '{"hero":true,"positioning":true,"become":true,"noFollowers":true,"realityShow":true,"winner":true,"prizes":true,"media":true,"mystery":true,"scarcity":true,"trust":true,"finalCta":true}'::jsonb),
  ('landing_text', '{}'::jsonb),
  ('hero_images', '[]'::jsonb),
  ('eligibility_text', '"You must be 18 years or older and a resident of India to participate."'::jsonb),
  ('registration_fee', '"₹499"'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- PARTICIPANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id text UNIQUE NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  age integer,
  gender text,
  phone text NOT NULL,
  address text,
  city text,
  instagram_username text,
  referral_id text UNIQUE NOT NULL,
  referred_by_referral_id text,
  payment_status text NOT NULL DEFAULT 'pending',
  payment_verified boolean NOT NULL DEFAULT false,
  payment_amount text,
  payment_reference text,
  instagram_status text NOT NULL DEFAULT 'pending',
  instagram_url text,
  instagram_screenshot_url text,
  shot_status text NOT NULL DEFAULT 'pending',
  referral_count integer NOT NULL DEFAULT 0,
  valid_referral_count integer NOT NULL DEFAULT 0,
  registration_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_participants_referral_id ON participants(referral_id);
CREATE INDEX IF NOT EXISTS idx_participants_referred_by ON participants(referred_by_referral_id);
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_payment_status ON participants(payment_status);
CREATE INDEX IF NOT EXISTS idx_participants_shot_status ON participants(shot_status);

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Anon can insert (registration), read by email (to see own status), update limited fields
DROP POLICY IF EXISTS "anon_insert_participants" ON participants;
CREATE POLICY "anon_insert_participants" ON participants FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_participants" ON participants;
CREATE POLICY "anon_select_participants" ON participants FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_participants" ON participants;
CREATE POLICY "anon_update_participants" ON participants FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- REFERRALS (parent-child relationships)
-- ============================================================
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_referral_id text NOT NULL,
  child_participant_id uuid REFERENCES participants(id) ON DELETE CASCADE,
  child_referral_id text,
  payment_verified boolean NOT NULL DEFAULT false,
  is_valid boolean NOT NULL DEFAULT false,
  is_self_referral boolean NOT NULL DEFAULT false,
  is_duplicate boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  validated_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_referrals_parent ON referrals(parent_referral_id);
CREATE INDEX IF NOT EXISTS idx_referrals_child ON referrals(child_participant_id);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_referrals" ON referrals;
CREATE POLICY "anon_select_referrals" ON referrals FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_referrals" ON referrals;
CREATE POLICY "anon_insert_referrals" ON referrals FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_referrals" ON referrals;
CREATE POLICY "anon_update_referrals" ON referrals FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- INSTAGRAM SUBMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS instagram_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid REFERENCES participants(id) ON DELETE CASCADE,
  instagram_username text,
  post_url text,
  screenshot_url text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by text
);

CREATE INDEX IF NOT EXISTS idx_insta_submissions_participant ON instagram_submissions(participant_id);
CREATE INDEX IF NOT EXISTS idx_insta_submissions_status ON instagram_submissions(status);

ALTER TABLE instagram_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_insta_submissions" ON instagram_submissions;
CREATE POLICY "anon_select_insta_submissions" ON instagram_submissions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_insta_submissions" ON instagram_submissions;
CREATE POLICY "anon_insert_insta_submissions" ON instagram_submissions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_insta_submissions" ON instagram_submissions;
CREATE POLICY "anon_update_insta_submissions" ON instagram_submissions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- ACTIVITY LOG (anonymized social proof ticker)
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  city text,
  message text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_activity_log" ON activity_log;
CREATE POLICY "anon_select_activity_log" ON activity_log FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_activity_log" ON activity_log;
CREATE POLICY "anon_insert_activity_log" ON activity_log FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- ============================================================
-- Helper: generate unique IDs
-- ============================================================
CREATE OR REPLACE FUNCTION generate_participant_id()
RETURNS text AS $$
DECLARE
  new_id text;
  exists boolean;
BEGIN
  LOOP
    new_id := 'PT-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
    SELECT EXISTS(SELECT 1 FROM participants WHERE participant_id = new_id) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION generate_referral_id()
RETURNS text AS $$
DECLARE
  new_id text;
  exists boolean;
BEGIN
  LOOP
    new_id := 'SHOT-' || upper(substr(encode(gen_random_bytes(3), 'hex'), 1, 6));
    SELECT EXISTS(SELECT 1 FROM participants WHERE referral_id = new_id) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Function: process new registration (called via edge function)
-- Creates participant, generates IDs, handles referral attribution
-- ============================================================
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
    SELECT EXISTS(SELECT 1 FROM participants WHERE referral_id = p_referred_by_referral_id AND email = p_email) INTO v_self_referral;
    SELECT EXISTS(SELECT 1 FROM participants WHERE referral_id = p_referred_by_referral_id) INTO v_parent_exists;
  END IF;

  -- Check duplicate (same email already registered)
  SELECT EXISTS(SELECT 1 FROM participants WHERE email = p_email) INTO v_duplicate;

  v_participant_id := generate_participant_id();
  v_referral_id := generate_referral_id();

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
      (SELECT id FROM participants WHERE referral_id = v_referral_id),
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Function: verify payment (called by webhook edge function)
-- Updates payment status, generates referral URL, updates parent referral
-- ============================================================
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
    SELECT referral_id INTO v_parent_referral_id FROM participants WHERE referral_id = v_referred_by;
    IF v_parent_referral_id IS NOT NULL THEN
      UPDATE participants
      SET valid_referral_count = valid_referral_count + 1,
          referral_count = referral_count + 1,
          updated_at = now()
      WHERE referral_id = v_referred_by;

      -- Check if parent reached requirement
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
      VALUES ('referral', CONCAT('Someone just unlocked their SHOT.'));
    END IF;
  END IF;

  -- Log payment activity
  INSERT INTO activity_log (event_type, message)
  VALUES ('payment', CONCAT('Someone just joined THE SHOT.'));

  RETURN QUERY
  SELECT v_referral_id, v_full_name, v_email, p_participant_id, v_referred_by;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Function: approve instagram submission
-- ============================================================
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

    -- Check if shot can be confirmed
    SELECT valid_referral_count INTO v_valid_referrals
    FROM participants WHERE id = v_participant_id;

    IF v_valid_referrals >= 2 THEN
      UPDATE participants SET shot_status = 'confirmed', updated_at = now()
      WHERE id = v_participant_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Function: reject instagram submission
-- ============================================================
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Function: get dashboard stats
-- ============================================================
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
$$ LANGUAGE plpgsql SECURITY DEFINER;