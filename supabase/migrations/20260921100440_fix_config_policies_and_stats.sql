-- FIX: admin_config had no INSERT/UPDATE policies, so all config saves failed silently
DROP POLICY IF EXISTS "anon_insert_admin_config" ON admin_config;
CREATE POLICY "anon_insert_admin_config" ON admin_config FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_admin_config" ON admin_config;
CREATE POLICY "anon_update_admin_config" ON admin_config FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Seed social proof default config
INSERT INTO admin_config (key, value) VALUES
  ('social_proof_mode', '"campaign"'::jsonb),
  ('social_proof_number', '500000'::jsonb),
  ('social_proof_label', '"PEOPLE ARE WATCHING THE SHOT"'::jsonb),
  ('activity_mode', '"campaign"'::jsonb),
  ('activity_cities', '["Mumbai","Delhi","Noida","Lucknow","Jaipur","Bengaluru","Hyderabad","Pune","Chandigarh","Kolkata","Ahmedabad","Ghaziabad","Meerut","Muzaffarnagar"]'::jsonb),
  ('activity_frequency', '5'::jsonb),
  ('activity_messages', '["THE SHOT IS GETTING ATTENTION","Interest is growing","THE SHOT is being discovered","People are checking in"]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Update get_admin_stats to include all requested metrics
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build(
    'total_registrations', (SELECT count(*) FROM participants),
    'paid_registrations', (SELECT count(*) FROM participants WHERE payment_verified = true),
    'pending_payments', (SELECT count(*) FROM participants WHERE payment_verified = false),
    'successful_payments', (SELECT count(*) FROM participants WHERE payment_verified = true),
    'failed_payments', (SELECT count(*) FROM participants WHERE payment_status = 'failed'),
    'total_revenue', (SELECT count(*) FROM participants WHERE payment_verified = true),
    'confirmed_shots', (SELECT count(*) FROM participants WHERE shot_status = 'confirmed'),
    'pending_shots', (SELECT count(*) FROM participants WHERE shot_status = 'pending'),
    'unlocked_shots', (SELECT count(*) FROM participants WHERE shot_status = 'unlocked'),
    'successful_referrals', (SELECT count(*) FROM referrals WHERE is_valid = true),
    'zero_referral_participants', (SELECT count(*) FROM participants WHERE valid_referral_count = 0),
    'one_referral_participants', (SELECT count(*) FROM participants WHERE valid_referral_count = 1),
    'two_plus_referral_participants', (SELECT count(*) FROM participants WHERE valid_referral_count >= 2),
    'pending_instagram', (SELECT count(*) FROM instagram_submissions WHERE status = 'pending'),
    'approved_instagram', (SELECT count(*) FROM instagram_submissions WHERE status = 'approved'),
    'rejected_instagram', (SELECT count(*) FROM instagram_submissions WHERE status = 'rejected'),
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;