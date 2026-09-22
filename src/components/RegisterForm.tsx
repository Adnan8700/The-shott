import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getConfig, type AdminConfig } from '@/lib/config';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface RegisterFormProps {
  refId: string | null;
  onBack: () => void;
  onRegistered: (participantId: string, email: string) => void;
}

export function RegisterForm({ refId, onBack, onRegistered }: RegisterFormProps) {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referralValid, setReferralValid] = useState<boolean | null>(null);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    age: '',
    gender: '',
    phone: '',
    address: '',
    city: '',
    instagram_username: '',
    referral_id: refId || '',
    username: '',
    password: '',
    agree_terms: false,
    agree_privacy: false,
    confirm_eligibility: false,
    confirm_accurate: false,
  });

  useEffect(() => {
    getConfig().then(setConfig);
  }, []);

  useEffect(() => {
    if (form.referral_id) {
      (async () => {
        const { data } = await supabase
          .from('participants')
          .select('referral_id')
          .eq('referral_id', form.referral_id)
          .maybeSingle();
        setReferralValid(!!data);
      })();
    } else {
      setReferralValid(null);
    }
  }, [form.referral_id]);

  const update = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const allChecked =
    form.agree_terms && form.agree_privacy && form.confirm_eligibility && form.confirm_accurate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

        if (!form.full_name || !form.email || !form.phone || !form.username || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
          if (!form.full_name || !form.email || !form.phone || !form.username || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    if (form.age && (parseInt(form.age) < 18 || parseInt(form.age) > 100)) {
      setError('You must be 18 or older to participate.');
      return;
    }
    if (form.age && (parseInt(form.age) < 18 || parseInt(form.age) > 100)) {
      setError('You must be 18 or older to participate.');
      return;
    }
    if (!allChecked) {
      setError('Please confirm all required agreements.');
      return;
    }

    setSubmitting(true);

    try {
      const { data, error: rpcError } = await supabase.rpc('create_participant', {
        p_full_name: form.full_name,
        p_email: form.email,
        p_age: form.age ? parseInt(form.age) : null,
        p_gender: form.gender || null,
        p_phone: form.phone,
        p_address: form.address || null,
        p_city: form.city || null,
        p_instagram_username: form.instagram_username || null,
        p_referred_by_referral_id: form.referral_id || null,
        p_username: form.username,
        p_password_hash: btoa(form.password),
      });

      if (rpcError) throw rpcError;
      if (!data || data.length === 0) throw new Error('Registration failed.');

      const result = data[0];
      onRegistered(result.participant_id, result.email);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white font-grotesk text-sm placeholder:text-gray-600 focus:border-[#00ff88]/50 transition-colors';

  return (
    <div className="min-h-screen bg-black py-20 px-5">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-sm font-grotesk"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="text-center mb-12">
          <p className="text-xs font-grotesk tracking-[0.3em] text-[#00ff88] uppercase mb-3">Registration</p>
          <h1 className="font-display font-black text-white text-4xl md:text-5xl tracking-tight">
            TAKE YOUR <span className="text-[#00ff88]">SHOT</span>
          </h1>
          {config && (
            <p className="mt-4 text-sm text-gray-500 font-grotesk">
              Registration Fee: <span className="text-white">{config.registration_fee}</span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-grotesk tracking-wider text-gray-500 uppercase mb-2">Full Name *</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => update('full_name', e.target.value)}
              className={inputClass}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-grotesk tracking-wider text-gray-500 uppercase mb-2">Username *</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => update('username', e.target.value)}
                className={inputClass}
                placeholder="Choose a username"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-grotesk tracking-wider text-gray-500 uppercase mb-2">Password *</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                className={inputClass}
                placeholder="Choose a password"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-grotesk tracking-wider text-gray-500 uppercase mb-2">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className={inputClass}
                placeholder="you@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-grotesk tracking-wider text-gray-500 uppercase mb-2">Phone Number *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className={inputClass}
                placeholder="+91 XXXXX XXXXX"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-grotesk tracking-wider text-gray-500 uppercase mb-2">Age</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => update('age', e.target.value)}
                className={inputClass}
                placeholder="18+"
                min="18"
                max="100"
              />
            </div>
            <div>
              <label className="block text-xs font-grotesk tracking-wider text-gray-500 uppercase mb-2">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => update('gender', e.target.value)}
                className={inputClass}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-grotesk tracking-wider text-gray-500 uppercase mb-2">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              className={inputClass}
              placeholder="Your address"
            />
          </div>

          <div>
            <label className="block text-xs font-grotesk tracking-wider text-gray-500 uppercase mb-2">City</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              className={inputClass}
              placeholder="Your city"
            />
          </div>

          <div>
            <label className="block text-xs font-grotesk tracking-wider text-gray-500 uppercase mb-2">Instagram Username</label>
            <input
              type="text"
              value={form.instagram_username}
              onChange={(e) => update('instagram_username', e.target.value)}
              className={inputClass}
              placeholder="@username"
            />
          </div>

          <div>
            <label className="block text-xs font-grotesk tracking-wider text-gray-500 uppercase mb-2">Referral ID (Optional)</label>
            <input
              type="text"
              value={form.referral_id}
              onChange={(e) => update('referral_id', e.target.value)}
              className={`${inputClass} ${
                form.referral_id
                  ? referralValid
                    ? 'border-[#00ff88]/40'
                    : referralValid === false
                    ? 'border-red-500/40'
                    : ''
                  : ''
              }`}
              placeholder="SHOT-XXXXXX (if you were referred)"
            />
            <p className="mt-2 text-xs text-gray-600 font-grotesk">
              Have a Referral ID? Enter it here to join through a participant's referral.
            </p>
            {form.referral_id && referralValid === false && (
              <p className="mt-1 text-xs text-red-500/70 font-grotesk">Referral ID not found.</p>
            )}
            {form.referral_id && referralValid === true && (
              <p className="mt-1 text-xs text-[#00ff88] font-grotesk flex items-center gap-1">
                <Check size={12} /> Valid referral ID detected.
              </p>
            )}
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 pt-4">
            {[
              { key: 'agree_terms', label: 'I agree to the Terms & Conditions' },
              { key: 'agree_privacy', label: 'I agree to the Privacy Policy' },
              { key: 'confirm_eligibility', label: 'I confirm I meet the eligibility requirements' },
              { key: 'confirm_accurate', label: 'I confirm all information provided is accurate' },
            ].map((cb) => (
              <label key={cb.key} className="flex items-start gap-3 cursor-pointer group">
                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all ${
                  (form as Record<string, unknown>)[cb.key] as boolean
                    ? 'bg-[#00ff88] border-[#00ff88]'
                    : 'border-white/20 group-hover:border-white/40'
                }`}>
                  {(form as Record<string, unknown>)[cb.key] as boolean && <Check size={14} className="text-black" />}
                </div>
                <input
                  type="checkbox"
                  checked={(form as Record<string, unknown>)[cb.key] as boolean}
                  onChange={(e) => update(cb.key, e.target.checked)}
                  className="sr-only"
                />
                <span className="text-sm text-gray-400 font-grotesk">{cb.label}</span>
              </label>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400 font-grotesk">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[#00ff88] text-black font-display font-bold text-sm tracking-widest uppercase rounded-sm hover:bg-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? 'Processing...' : <>Continue <ArrowRight size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
