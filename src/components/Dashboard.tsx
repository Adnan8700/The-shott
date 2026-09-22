import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getConfig, type AdminConfig } from '@/lib/config';
import { getCountdown, formatDate } from '@/lib/utils';
import { Copy, Check, Share2, Download, Instagram, Clock, Users, CreditCard, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import type { Participant } from '@/lib/types';

interface DashboardProps {
  participantId: string;
  onBack: () => void;
}

export function Dashboard({ participantId, onBack }: DashboardProps) {
    useEffect(() => {
    const session = sessionStorage.getItem('shot-user-session');
    if (session !== participantId) {
      window.location.hash = '/login';
    }
  }, [participantId]);
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [copied, setCopied] = useState(false);
  const [deadlineCountdown, setDeadlineCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });
  const [startCountdown, setStartCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });
  const [showInstagramForm, setShowInstagramForm] = useState(false);
  const [igForm, setIgForm] = useState({ username: '', url: '', screenshot: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const cfg = await getConfig();
      setConfig(cfg);
      const { data } = await supabase
        .from('participants')
        .select('*')
        .eq('participant_id', participantId)
        .maybeSingle();
      setParticipant(data as Participant | null);
      if (data) {
        setIgForm({
          username: (data as Participant).instagram_username || '',
          url: (data as Participant).instagram_url || '',
          screenshot: '',
        });
      }
    })();
  }, [participantId]);

  useEffect(() => {
    if (!config) return;
    const update = () => {
      if (config.registration_deadline) {
        setDeadlineCountdown(getCountdown(config.registration_deadline));
      }
      if (config.show_start_date) {
        setStartCountdown(getCountdown(config.show_start_date));
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [config]);

  if (!participant || !config) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-500 font-grotesk text-sm">Loading...</div>
      </div>
    );
  }

  const referralUrl = `${window.location.origin}/#/register?ref=${participant.referral_id}`;
  const required = config.referral_requirement;
  const progress = participant.valid_referral_count;

  const copyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submitInstagram = async () => {
    if (!igForm.url) return;
    setSubmitting(true);
    try {
      await supabase.from('instagram_submissions').insert({
        participant_id: participant.id,
        instagram_username: igForm.username,
        post_url: igForm.url,
        screenshot_url: igForm.screenshot || null,
        status: 'pending',
      });
      await supabase
        .from('participants')
        .update({
          instagram_status: 'pending',
          instagram_url: igForm.url,
          updated_at: new Date().toISOString(),
        })
        .eq('participant_id', participantId);
      setShowInstagramForm(false);
      // Refresh
      const { data } = await supabase
        .from('participants')
        .select('*')
        .eq('participant_id', participantId)
        .maybeSingle();
      setParticipant(data as Participant | null);
    } finally {
      setSubmitting(false);
    }
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'PENDING', color: 'text-yellow-500' },
    unlocked: { label: 'GOAL COMPLETE', color: 'text-[#00ff88]' },
    confirmed: { label: 'CONFIRMED', color: 'text-[#00ff88]' },
    approved: { label: 'VERIFIED', color: 'text-[#00ff88]' },
    rejected: { label: 'REJECTED', color: 'text-red-500' },
    paid: { label: 'COMPLETE', color: 'text-[#00ff88]' },
  };

  const StatusItem = ({ icon: Icon, label, status, sublabel }: {
    icon: typeof CreditCard;
    label: string;
    status: string;
    sublabel?: string;
  }) => {
    const cfg = statusConfig[status] || statusConfig.pending;
    return (
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <Icon size={18} className="text-gray-500" />
          <span className="text-xs font-grotesk tracking-wider text-gray-500 uppercase">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {status === 'paid' || status === 'approved' || status === 'confirmed' || status === 'unlocked' ? (
            <CheckCircle size={20} className={cfg.color} />
          ) : status === 'rejected' ? (
            <AlertCircle size={20} className={cfg.color} />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
          )}
          <span className={`font-display font-bold text-sm tracking-wider ${cfg.color}`}>
            {cfg.label}
          </span>
        </div>
        {sublabel && <p className="mt-2 text-xs text-gray-600 font-grotesk">{sublabel}</p>}
      </div>
    );
  };

  const shotConfirmed = participant.shot_status === 'confirmed';

  return (
    <div className="min-h-screen bg-black py-20 px-5">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-sm font-grotesk"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display font-black text-white text-3xl md:text-5xl tracking-tight">
            YOUR <span className="text-[#00ff88]">SHOT</span>
          </h1>
          <p className="mt-4 text-sm text-gray-500 font-grotesk">
            {participant.full_name}
          </p>
        </div>

        {/* Confirmed banner */}
        {shotConfirmed && (
          <div className="bg-gradient-to-r from-[#00ff88]/10 to-transparent border border-[#00ff88]/30 rounded-xl p-8 text-center mb-8 pulse-glow">
            <CheckCircle size={40} className="text-[#00ff88] mx-auto mb-4" />
            <h2 className="font-display font-black text-white text-2xl md:text-3xl tracking-tight">
              YOUR SHOT IS <span className="text-[#00ff88]">CONFIRMED.</span>
            </h2>
            <p className="mt-4 font-display font-bold text-white text-lg">
              SEE YOU ON {formatDate(config.show_start_date)}.
            </p>
            <p className="mt-3 text-sm text-gray-400 font-grotesk max-w-md mx-auto">
              You've taken the first step. Now keep your eyes open. The experience begins soon.
            </p>
          </div>
        )}

        {/* Participant info */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 font-grotesk uppercase tracking-wider mb-1">Participant ID</p>
              <p className="text-sm text-white font-grotesk">{participant.participant_id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-grotesk uppercase tracking-wider mb-1">Referral ID</p>
              <p className="text-sm text-[#00ff88] font-grotesk">{participant.referral_id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-grotesk uppercase tracking-wider mb-1">Registration Date</p>
              <p className="text-sm text-white font-grotesk">{formatDate(participant.registration_date)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-grotesk uppercase tracking-wider mb-1">Referred By</p>
              <p className="text-sm text-white font-grotesk">{participant.referred_by_referral_id || 'Direct'}</p>
            </div>
          </div>
        </div>

        {/* Status grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatusItem icon={CreditCard} label="Payment" status={participant.payment_verified ? 'paid' : 'pending'} />
          <StatusItem
            icon={Instagram}
            label="Instagram Share"
            status={participant.instagram_status}
            sublabel={participant.instagram_status === 'pending' ? 'Awaiting submission' : undefined}
          />
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <Users size={18} className="text-gray-500" />
              <span className="text-xs font-grotesk tracking-wider text-gray-500 uppercase">Referrals</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-display font-bold text-2xl tracking-wider ${
                progress >= required ? 'text-[#00ff88]' : 'text-white'
              }`}>
                {progress} / {required}
              </span>
            </div>
            <div className="mt-3 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00ff88] rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((progress / required) * 100, 100)}%` }}
              />
            </div>
          </div>
          <StatusItem icon={CheckCircle} label="Shot Status" status={participant.shot_status} />
        </div>

        {/* Countdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <Clock size={18} className="text-[#00ff88]" />
              <span className="text-xs font-grotesk tracking-wider text-gray-500 uppercase">Referral Deadline</span>
            </div>
            <div className="flex gap-3">
              {[
                { label: 'D', value: deadlineCountdown.days },
                { label: 'H', value: deadlineCountdown.hours },
                { label: 'M', value: deadlineCountdown.minutes },
                { label: 'S', value: deadlineCountdown.seconds },
              ].map((u) => (
                <div key={u.label}>
                  <span className="font-display font-bold text-white text-2xl tabular-nums">
                    {String(u.value).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-gray-600 ml-1">{u.label}</span>
                </div>
              ))}
            </div>
            {config.registration_deadline && (
              <p className="mt-3 text-xs text-gray-600 font-grotesk">
                {formatDate(config.registration_deadline)}
              </p>
            )}
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <Clock size={18} className="text-[#00ff88]" />
              <span className="text-xs font-grotesk tracking-wider text-gray-500 uppercase">Show Starts In</span>
            </div>
            <div className="flex gap-3">
              {[
                { label: 'D', value: startCountdown.days },
                { label: 'H', value: startCountdown.hours },
                { label: 'M', value: startCountdown.minutes },
                { label: 'S', value: startCountdown.seconds },
              ].map((u) => (
                <div key={u.label}>
                  <span className="font-display font-bold text-white text-2xl tabular-nums">
                    {String(u.value).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-gray-600 ml-1">{u.label}</span>
                </div>
              ))}
            </div>
            {config.show_start_date && (
              <p className="mt-3 text-xs text-gray-600 font-grotesk">
                {formatDate(config.show_start_date)}
              </p>
            )}
          </div>
        </div>

        {/* Referral link */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 mb-6">
          <p className="text-xs font-grotesk tracking-wider text-gray-500 uppercase mb-3">Your Referral Link</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-300 font-grotesk truncate">
              {referralUrl}
            </div>
            <button
              onClick={copyLink}
              className="px-4 py-3 bg-[#00ff88] text-black font-bold text-sm rounded-lg hover:bg-white transition-colors flex items-center gap-2"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'THE SHOT', url: referralUrl }).catch(() => {});
                } else {
                  copyLink();
                }
              }}
              className="px-4 py-3 border border-white/20 text-white rounded-lg hover:border-[#00ff88] transition-colors"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Instagram submission */}
        {participant.instagram_status !== 'approved' && !showInstagramForm && (
          <button
            onClick={() => setShowInstagramForm(true)}
            className="w-full py-4 border border-[#00ff88]/30 bg-[#00ff88]/5 text-[#00ff88] font-display font-bold text-sm tracking-widest uppercase rounded-lg hover:bg-[#00ff88]/10 transition-colors mb-6 flex items-center justify-center gap-2"
          >
            <Instagram size={18} /> Submit Instagram Share
          </button>
        )}

        {showInstagramForm && (
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 mb-6">
            <h3 className="font-display font-bold text-white text-lg mb-4">Instagram Verification</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-grotesk tracking-wider text-gray-500 uppercase mb-2">Instagram Username</label>
                <input
                  type="text"
                  value={igForm.username}
                  onChange={(e) => setIgForm({ ...igForm, username: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white font-grotesk text-sm focus:border-[#00ff88]/50"
                  placeholder="@username"
                />
              </div>
              <div>
                <label className="block text-xs font-grotesk tracking-wider text-gray-500 uppercase mb-2">Post / Reel / Story URL *</label>
                <input
                  type="url"
                  value={igForm.url}
                  onChange={(e) => setIgForm({ ...igForm, url: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white font-grotesk text-sm focus:border-[#00ff88]/50"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-grotesk tracking-wider text-gray-500 uppercase mb-2">Screenshot URL (optional)</label>
                <input
                  type="url"
                  value={igForm.screenshot}
                  onChange={(e) => setIgForm({ ...igForm, screenshot: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white font-grotesk text-sm focus:border-[#00ff88]/50"
                  placeholder="https://..."
                />
              </div>
              <p className="text-xs text-gray-600 font-grotesk">
                Your submission will be reviewed by admin. Only admin-approved submissions count as verified.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={submitInstagram}
                  disabled={submitting || !igForm.url}
                  className="flex-1 py-3 bg-[#00ff88] text-black font-bold text-sm rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit for Review'}
                </button>
                <button
                  onClick={() => setShowInstagramForm(false)}
                  className="px-6 py-3 border border-white/20 text-white text-sm rounded-lg hover:border-white/40"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Deadline warning */}
        {!deadlineCountdown.expired && (
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-5 mb-6">
            <p className="text-xs text-yellow-500/80 font-grotesk leading-relaxed">
              <span className="font-bold">REFERRAL DEADLINE: {formatDate(config.registration_deadline)}</span>
              <br />
              {config.refund_policy}
            </p>
          </div>
        )}

        {/* Action buttons */}
        {shotConfirmed && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={copyLink}
              className="py-3 border border-white/20 text-white font-grotesk text-sm rounded-lg hover:border-[#00ff88] hover:text-[#00ff88] transition-colors flex items-center justify-center gap-2"
            >
              <Copy size={16} /> Copy Referral Link
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'THE SHOT', url: referralUrl }).catch(() => {});
                }
              }}
              className="py-3 border border-white/20 text-white font-grotesk text-sm rounded-lg hover:border-[#00ff88] hover:text-[#00ff88] transition-colors flex items-center justify-center gap-2"
            >
              <Share2 size={16} /> Share The Shot
            </button>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="py-3 border border-white/20 text-white font-grotesk text-sm rounded-lg hover:border-[#00ff88] hover:text-[#00ff88] transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} /> View My Status
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
