import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { getConfig, type AdminConfig } from '@/lib/config';
import { ArrowLeft, Shield, Lock } from 'lucide-react';
import type { Participant } from '@/lib/types';

interface PaymentPageProps {
  participantId: string;
  onBack: () => void;
  onPaymentSuccess: (participantId: string) => void;
}

export function PaymentPage({ participantId, onBack, onPaymentSuccess }: PaymentPageProps) {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const paymentContainerRef = useRef<HTMLDivElement>(null);

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
      setLoading(false);
    })();
  }, [participantId]);

    // Payment HTML ke <script> tags ko manually re-create karte hain, warna browser unhe run nahi karta
  useEffect(() => {
    const container = paymentContainerRef.current;
    if (!container || container.dataset.scriptsLoaded === 'true') return;
    container.dataset.scriptsLoaded = 'true';
    container.style.pointerEvents = 'auto';
    container.querySelectorAll('script').forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value)
      );
      newScript.text = oldScript.text;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [config, loading]);

  // Poll for payment verification (in case webhook updates the DB)
  const checkPaymentStatus = async () => {
    setChecking(true);
    const { data } = await supabase
      .from('participants')
      .select('payment_verified, payment_status')
      .eq('participant_id', participantId)
      .maybeSingle();
    if (data?.payment_verified) {
      onPaymentSuccess(participantId);
    } else {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-500 font-grotesk text-sm">Loading...</div>
      </div>
    );
  }

  if (participant?.payment_verified) {
    onPaymentSuccess(participantId);
    return null;
  }

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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00ff88]/10 mb-6">
            <Lock size={28} className="text-[#00ff88]" />
          </div>
          <h1 className="font-display font-black text-white text-3xl md:text-4xl tracking-tight">
            SECURE <span className="text-[#00ff88]">PAYMENT</span>
          </h1>
          <p className="mt-4 text-sm text-gray-500 font-grotesk">
            Complete your registration payment to get your referral ID.
          </p>
        </div>

        {/* Order summary */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400 font-grotesk">Participant</span>
            <span className="text-sm text-white font-grotesk">{participant?.full_name}</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400 font-grotesk">Participant ID</span>
            <span className="text-sm text-white font-grotesk">{participant?.participant_id}</span>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <span className="text-sm text-gray-400 font-grotesk">Registration Fee</span>
            <span className="text-xl font-display font-bold text-[#00ff88]">
              {config?.registration_fee ?? '₹499'}
            </span>
          </div>
        </div>

        {/* Payment button area — admin-configurable HTML */}
        {config?.payment_enabled && config.payment_html ? (
          <div
            ref={paymentContainerRef}
            className="payment-button-container relative z-10"
            style={{ pointerEvents: 'auto' }}
            dangerouslySetInnerHTML={{ __html: config.payment_html }}
          />
        ) : (
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-6 text-center">
            <p className="text-sm text-yellow-500/80 font-grotesk">
              Payment option is being configured.
            </p>
            <p className="text-xs text-gray-500 font-grotesk mt-2">
              Please check back shortly or contact support.
            </p>
          </div>
        )}

        {/* Manual check for payment status (webhook-based) */}
        <button
          onClick={checkPaymentStatus}
          disabled={checking}
          className="mt-6 w-full py-3 border border-white/10 text-gray-400 font-grotesk text-sm rounded-lg hover:border-[#00ff88]/30 hover:text-white transition-colors disabled:opacity-50"
        >
          {checking ? 'Verifying payment...' : 'I have completed payment — Verify'}
        </button>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-600 font-grotesk">
          <Shield size={14} />
          <span>Payment is verified through a secure webhook — not just a frontend message.</span>
        </div>
      </div>
    </div>
  );
}
