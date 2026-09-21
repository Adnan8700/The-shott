import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { getConfig, type AdminConfig } from '@/lib/config';
import { Copy, Check, Download, Share2, ArrowRight } from 'lucide-react';
import type { Participant } from '@/lib/types';

interface ThankYouProps {
  participantId: string;
  onGoToDashboard: (participantId: string) => void;
}

export function ThankYou({ participantId, onGoToDashboard }: ThankYouProps) {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    })();
  }, [participantId]);

  useEffect(() => {
    if (!participant || !canvasRef.current) return;
    drawShareCard();
  }, [participant, config]);

  const referralUrl = participant
    ? `${window.location.origin}/#/register?ref=${participant.referral_id}`
    : '';

  const drawShareCard = () => {
    const canvas = canvasRef.current;
    if (!canvas || !participant) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1080;
    const H = 1350;
    canvas.width = W;
    canvas.height = H;

    // Background gradient
    const bgGrad = ctx.createRadialGradient(W / 2, H * 0.3, 0, W / 2, H * 0.5, W);
    bgGrad.addColorStop(0, '#1a1a1a');
    bgGrad.addColorStop(0.5, '#0a0a0a');
    bgGrad.addColorStop(1, '#050505');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Grid pattern
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Green glow circle
    const glowGrad = ctx.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H * 0.4, 300);
    glowGrad.addColorStop(0, 'rgba(0, 255, 136, 0.08)');
    glowGrad.addColorStop(1, 'rgba(0, 255, 136, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, W, H);

    // Border
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, W - 80, H - 80);

    // "I TOOK THE SHOT."
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('I TOOK', W / 2, H * 0.25);
    ctx.fillStyle = '#00ff88';
    ctx.fillText('THE SHOT.', W / 2, H * 0.33);

    // User name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Inter, sans-serif';
    const name = participant.full_name.toUpperCase();
    ctx.fillText(name, W / 2, H * 0.45);

    // Divider
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W * 0.3, H * 0.5);
    ctx.lineTo(W * 0.7, H * 0.5);
    ctx.stroke();

    // THE SHOT + date
    ctx.fillStyle = '#888888';
    ctx.font = '600 36px Space Grotesk, sans-serif';
    ctx.fillText('THE SHOT', W / 2, H * 0.56);
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 40px Orbitron, sans-serif';
    const dateStr = config?.show_start_date
      ? new Date(config.show_start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long' }).toUpperCase()
      : '15 OCTOBER';
    ctx.fillText(dateStr, W / 2, H * 0.62);

    // Tagline
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px Inter, sans-serif';
    ctx.fillText("I'M TAKING MY SHOT.", W / 2, H * 0.72);

    // Social handle
    ctx.fillStyle = '#00ff88';
    ctx.font = '600 36px Space Grotesk, sans-serif';
    const handle = config?.social_instagram ?? '@THESHOTOFFICIAL';
    ctx.fillText(handle.toUpperCase(), W / 2, H * 0.8);

    // Referral ID
    ctx.fillStyle = '#666666';
    ctx.font = '500 28px Space Grotesk, sans-serif';
    ctx.fillText(`REF: ${participant.referral_id}`, W / 2, H * 0.88);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCaption = () => {
    const caption = `I TOOK THE SHOT.\n\n${participant?.full_name}\nTHE SHOT\n${config?.show_start_date ? new Date(config.show_start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long' }) : '15 October'}\n\nI'M TAKING MY SHOT.\n\n${config?.social_instagram ?? '@THESHOTOFFICIAL'}\n\nJoin with my referral: ${referralUrl}`;
    navigator.clipboard.writeText(caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const downloadCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `the-shot-${participant?.referral_id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const shareOnInstagram = () => {
    if (navigator.share) {
      navigator.share({
        title: 'I Took THE SHOT',
        text: `I'm taking my shot. Join me: ${referralUrl}`,
        url: referralUrl,
      }).catch(() => {});
    } else {
      copyLink();
    }
  };

  if (!participant) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-500 font-grotesk text-sm">Loading...</div>
      </div>
    );
  }

  const progress = participant.valid_referral_count;
  const required = config?.referral_requirement ?? 2;

  return (
    <div className="min-h-screen bg-black py-20 px-5">
      <div className="max-w-3xl mx-auto">
        {/* Thank you header */}
        <div className="text-center mb-12 fade-in">
          <h1 className="font-display font-black text-white text-5xl md:text-7xl tracking-tight">
            THANK <span className="text-[#00ff88]">YOU.</span>
          </h1>
          <p className="mt-6 font-display font-bold text-[#00ff88] text-xl md:text-3xl tracking-wide">
            YOUR SHOT IS IN.
          </p>
        </div>

        {/* Referral opportunity */}
        <div className="bg-gradient-to-b from-[#00ff88]/[0.05] to-transparent border border-[#00ff88]/20 rounded-xl p-8 text-center mb-8">
          <p className="font-display font-bold text-white text-xl md:text-2xl tracking-wide">
            Want to increase your chances of winning?
          </p>
          <p className="mt-3 text-sm text-gray-400 font-grotesk max-w-lg mx-auto">
            Refer {required} more people and increase your chance of winning.
          </p>
        </div>

        {/* Referral ID + Link */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 mb-8">
          <div className="mb-6">
            <p className="text-xs font-grotesk tracking-wider text-gray-500 uppercase mb-2">Your Referral ID</p>
            <p className="font-display font-bold text-[#00ff88] text-2xl tracking-widest">{participant.referral_id}</p>
          </div>
          <div>
            <p className="text-xs font-grotesk tracking-wider text-gray-500 uppercase mb-2">Your Personal Link</p>
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
            </div>
          </div>
        </div>

        {/* Share card */}
        <div className="mb-8">
          <p className="text-xs font-grotesk tracking-wider text-gray-500 uppercase mb-4 text-center">
            Your Personalized Share Card
          </p>
          <div className="flex justify-center mb-6">
            <canvas
              ref={canvasRef}
              className="max-w-full rounded-xl border border-white/10"
              style={{ maxWidth: '400px' }}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={downloadCard}
              className="px-6 py-3 bg-[#00ff88] text-black font-bold text-sm rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2"
            >
              <Download size={16} /> Download Card
            </button>
            <button
              onClick={copyCaption}
              className="px-6 py-3 border border-white/20 text-white font-bold text-sm rounded-lg hover:border-[#00ff88] hover:text-[#00ff88] transition-colors flex items-center justify-center gap-2"
            >
              {copiedCaption ? <Check size={16} /> : <Copy size={16} />}
              {copiedCaption ? 'Copied' : 'Copy Caption'}
            </button>
            <button
              onClick={shareOnInstagram}
              className="px-6 py-3 border border-white/20 text-white font-bold text-sm rounded-lg hover:border-[#00ff88] hover:text-[#00ff88] transition-colors flex items-center justify-center gap-2"
            >
              <Share2 size={16} /> Share
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400 font-grotesk">Your Progress</span>
            <span className="font-display font-bold text-white text-lg">
              {progress} / {required} REFERRALS
            </span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00ff88] rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((progress / required) * 100, 100)}%` }}
            />
          </div>
          <p className="mt-4 text-center text-sm text-gray-400 font-grotesk">
            {progress === 0 && `Refer ${required} people to increase your chance of winning.`}
            {progress === 1 && `One more referral can increase your chance of winning.`}
            {progress >= 2 && `2 people referred — you've completed this referral goal.`}
          </p>
        </div>

        {/* Go to dashboard */}
        <button
          onClick={() => onGoToDashboard(participantId)}
          className="w-full py-4 bg-white/5 border border-white/10 text-white font-display font-bold text-sm tracking-widest uppercase rounded-sm hover:bg-white/10 hover:border-[#00ff88]/30 transition-all flex items-center justify-center gap-2"
        >
          View My Status <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
