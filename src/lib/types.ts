export interface Participant {
  id: string;
  participant_id: string;
  full_name: string;
  email: string;
  age: number | null;
  gender: string | null;
  phone: string;
  address: string | null;
  city: string | null;
  instagram_username: string | null;
  referral_id: string;
  referred_by_referral_id: string | null;
  payment_status: string;
  payment_verified: boolean;
  payment_amount: string | null;
  payment_reference: string | null;
  instagram_status: string;
  instagram_url: string | null;
  instagram_screenshot_url: string | null;
  shot_status: string;
  referral_count: number;
  valid_referral_count: number;
  registration_date: string;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  parent_referral_id: string;
  child_participant_id: string;
  child_referral_id: string;
  payment_verified: boolean;
  is_valid: boolean;
  is_self_referral: boolean;
  is_duplicate: boolean;
  created_at: string;
  validated_at: string | null;
}

export interface InstagramSubmission {
  id: string;
  participant_id: string;
  instagram_username: string | null;
  post_url: string | null;
  screenshot_url: string | null;
  status: string;
  admin_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface ActivityLog {
  id: string;
  event_type: string;
  city: string | null;
  message: string;
  created_at: string;
}

export interface Prize {
  rank: number;
  label: string;
  amount: string;
  count: number;
  confirmed: boolean;
}

export interface AdminConfig {
  show_start_date: string;
  registration_deadline: string;
  registration_window_days: number;
  referral_requirement: number;
  registration_open: boolean;
  prizes_enabled: boolean;
  prizes: Prize[];
  payment_html: string;
  payment_enabled: boolean;
  refund_policy: string;
  grace_period_days: number;
  social_instagram: string;
  social_youtube: string;
  sections: Record<string, boolean>;
  landing_text: Record<string, string>;
  hero_images: string[];
  eligibility_text: string;
  registration_fee: string;
  social_proof_mode: 'campaign' | 'real';
  social_proof_number: number;
  social_proof_label: string;
  activity_mode: 'campaign' | 'real';
  activity_cities: string[];
  activity_frequency: number;
  activity_messages: string[];
}

export const DEFAULT_CONFIG: AdminConfig = {
  show_start_date: '2026-10-15',
  registration_deadline: '2026-09-30',
  registration_window_days: 3,
  referral_requirement: 2,
  registration_open: true,
  prizes_enabled: true,
  prizes: [],
  payment_html: '',
  payment_enabled: false,
  refund_policy:
    'If you do not complete the required referral conditions by the stated deadline, your participation may be cancelled and any refund will be processed according to the published refund policy.',
  grace_period_days: 0,
  social_instagram: '@THESHOTOFFICIAL',
  social_youtube: '',
  sections: {
    hero: true,
    positioning: true,
    become: true,
    noFollowers: true,
    realityShow: true,
    winner: true,
    prizes: true,
    media: true,
    mystery: true,
    scarcity: true,
    trust: true,
    finalCta: true,
  },
  landing_text: {},
  hero_images: [],
  eligibility_text:
    'You must be 18 years or older and a resident of India to participate.',
  registration_fee: '₹499',
  social_proof_mode: 'campaign',
  social_proof_number: 500000,
  social_proof_label: 'PEOPLE ARE WATCHING THE SHOT',
  activity_mode: 'campaign',
  activity_cities: ['Mumbai', 'Delhi', 'Noida', 'Lucknow', 'Jaipur', 'Bengaluru', 'Hyderabad', 'Pune', 'Chandigarh', 'Kolkata', 'Ahmedabad', 'Ghaziabad', 'Meerut', 'Muzaffarnagar'],
  activity_frequency: 5,
  activity_messages: ['THE SHOT IS GETTING ATTENTION', 'Interest is growing', 'THE SHOT is being discovered', 'People are checking in'],
};
