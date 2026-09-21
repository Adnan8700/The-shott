import { Reveal } from './Reveal';
import { LiveCounters } from './LiveCounters';
import { getConfig, type AdminConfig } from '@/lib/config';
import type { Prize } from '@/lib/types';
import { formatDate, getCountdown } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Lock, Sparkles, Trophy, Users, Eye, Star, Heart, Camera, Tv, Youtube, Instagram, Smartphone, Share2, Download, Copy, Check } from 'lucide-react';

// ============================================================
// CORE POSITIONING SECTION
// ============================================================
export function PositioningSection() {
  const words = ['ORDINARY', 'FAME', 'OPPORTUNITY', 'AUDIENCE', 'STAR'];
  const [visibleWord, setVisibleWord] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleWord((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="experience" className="relative py-24 md:py-32 bg-black overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-30" />
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 hidden md:block">
        <img
          src="https://images.pexels.com/photos/31746939/pexels-photo-31746939.jpeg?auto=compress&cs=tinysrgb&w=940"
          alt="Performer silhouette under stage lights"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.6) contrast(1.3)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
      </div>
      <div className="relative max-w-5xl mx-auto px-5">
        <Reveal>
          <p className="text-xs font-grotesk tracking-[0.3em] text-[#00ff88] uppercase mb-6 text-center">
            The Proposition
          </p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="font-display font-bold text-white text-center leading-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}>
            EVERY REALITY SHOW NEEDS PEOPLE TO WATCH.
            <br />
            <span className="text-gray-500">WE'RE GIVING ORDINARY PEOPLE A CHANCE TO BECOME THE PEOPLE EVERYONE WATCHES.</span>
          </h2>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-12 max-w-3xl mx-auto space-y-4 text-gray-400 font-grotesk text-center leading-relaxed">
            <p>Most traditional entertainment formats begin after someone has already built a name.</p>
            <p>They already have followers. They already have recognition. They already have connections.</p>
            <p className="text-white text-xl font-display font-bold">THE SHOT starts somewhere else.</p>
            <p className="text-2xl font-display font-bold text-[#00ff88]">It starts with you.</p>
          </div>
        </Reveal>

        {/* Animated words */}
        <Reveal delay={300}>
          <div className="mt-20 relative h-32 md:h-48 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00ff88]/5 to-transparent" />
            {words.map((word, i) => (
              <div
                key={word}
                className={`absolute font-display font-black tracking-widest transition-all duration-700 ${
                  visibleWord === i
                    ? 'opacity-100 scale-100 text-white'
                    : 'opacity-0 scale-75 text-gray-700'
                }`}
                style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)' }}
              >
                {word}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={400}>
          <p className="mt-12 text-center font-display font-bold text-white text-2xl md:text-4xl tracking-wide">
            YOU DON'T HAVE TO BE FAMOUS TO TAKE THE SHOT.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// BECOME THE PERSON SECTION
// ============================================================
const becomeCards = [
  { icon: Star, title: 'FAME', desc: 'Give yourself an opportunity to step into the spotlight.' },
  { icon: Eye, title: 'AUDIENCE', desc: 'Build visibility around your story and participation.' },
  { icon: Sparkles, title: 'CONFIDENCE', desc: 'Step outside the version of yourself that the world already knows.' },
  { icon: Trophy, title: 'OPPORTUNITY', desc: 'Put yourself in a format designed to discover new personalities.' },
  { icon: Users, title: 'RECOGNITION', desc: 'Participants who progress through the official stages can earn recognition, rewards and exposure according to the rules.' },
  { icon: Heart, title: 'YOUR STORY', desc: "Because your starting point doesn't have to define your destination." },
];

export function BecomeSection() {
  return (
    <section className="relative py-24 md:py-32 bg-[#0a0a0a] overflow-hidden">
      <div className="absolute inset-0 spotlight" />
      <div className="absolute bottom-0 left-0 w-1/3 h-2/3 opacity-15 hidden md:block">
        <img
          src="https://images.pexels.com/photos/8852719/pexels-photo-8852719.jpeg?auto=compress&cs=tinysrgb&w=940"
          alt="Videographer filming in neon-lit studio"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.5) contrast(1.2)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
      </div>
      <div className="relative max-w-6xl mx-auto px-5">
        <Reveal>
          <h2 className="font-display font-bold text-white text-center leading-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}>
            BECOME THE PERSON
            <br />
            <span className="text-[#00ff88]">YOU ALWAYS WANTED TO BE.</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {becomeCards.map((card, i) => (
            <Reveal key={card.title} delay={i * 100}>
              <div className="group relative h-full bg-gradient-to-b from-white/[0.03] to-transparent border border-white/10 rounded-xl p-8 transition-all duration-500 hover:border-[#00ff88]/30 hover:bg-white/[0.05]">
                <div className="w-12 h-12 rounded-lg bg-[#00ff88]/10 flex items-center justify-center mb-6 transition-all duration-500 group-hover:bg-[#00ff88]/20 group-hover:scale-110">
                  <card.icon size={24} className="text-[#00ff88]" />
                </div>
                <h3 className="font-display font-bold text-white text-xl tracking-wider mb-3">{card.title}</h3>
                <p className="text-gray-400 font-grotesk text-sm leading-relaxed">{card.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// NO FOLLOWERS REQUIRED SECTION
// ============================================================
export function NoFollowersSection({ onTakeShot }: { onTakeShot: () => void }) {
  return (
    <section className="relative py-24 md:py-32 bg-black overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/10864797/pexels-photo-10864797.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt=""
          className="w-full h-full object-cover opacity-15"
          style={{ filter: 'brightness(0.5) contrast(1.2)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
      </div>

      <div className="relative max-w-4xl mx-auto px-5 text-center">
        <Reveal>
          <h2 className="font-display font-black text-white leading-none" style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)' }}>
            NO FOLLOWERS.
            <br />
            NO CONNECTIONS.
            <br />
            NO FAMOUS NAME.
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-8 font-display font-bold text-[#00ff88] text-3xl md:text-5xl tracking-wide">
            JUST YOUR SHOT.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div className="mt-10 space-y-4 text-gray-400 font-grotesk max-w-2xl mx-auto leading-relaxed">
            <p>You don't need an existing audience to enter.</p>
            <p>You don't need to already be an influencer.</p>
            <p>You don't need someone inside the entertainment industry to recommend you.</p>
            <p className="text-white text-lg pt-4">
              THE SHOT is being created around the idea that ordinary people should have an
              opportunity to enter the spotlight too.
            </p>
          </div>
        </Reveal>
        <Reveal delay={400}>
          <button
            onClick={onTakeShot}
            className="mt-12 px-10 py-4 bg-[#00ff88] text-black font-display font-bold text-sm tracking-widest uppercase rounded-sm hover:scale-105 transition-transform duration-300 pulse-glow"
          >
            I Want My Shot
          </button>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// REALITY SHOW SECTION
// ============================================================
export function RealityShowSection() {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  useEffect(() => { getConfig().then(setConfig); }, []);

  const facts = [
    { label: 'START', value: config ? formatDate(config.show_start_date) : '15 October' },
    { label: 'FORMAT', value: '3 MONTHS' },
    { label: 'PLATFORM', value: 'SOCIAL + DIGITAL + FUTURE BROADCAST / STREAMING EXPANSION' },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-[#0a0a0a] overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-30" />
      <div className="absolute top-0 left-0 w-1/3 h-full opacity-15 hidden lg:block">
        <img
          src="https://images.pexels.com/photos/36439651/pexels-photo-36439651.jpeg?auto=compress&cs=tinysrgb&w=940"
          alt="Performer silhouette with dramatic backlight"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.5) contrast(1.3)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
      </div>
      <div className="relative max-w-5xl mx-auto px-5">
        <Reveal>
          <h2 className="font-display font-bold text-white text-center leading-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}>
            A REALITY SHOW FOR PEOPLE
            <br />
            <span className="text-gray-500">WHO AREN'T ALREADY FAMOUS.</span>
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-8 text-gray-400 font-grotesk text-center max-w-2xl mx-auto leading-relaxed">
            THE SHOT is planned as a multi-stage social reality experience where participants
            can take part in challenges, audience-driven moments, social content and competition.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5">
          {facts.map((fact, i) => (
            <Reveal key={fact.label} delay={i * 100}>
              <div className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/10 rounded-xl p-8 text-center h-full">
                <p className="text-xs font-grotesk tracking-[0.3em] text-[#00ff88] uppercase mb-4">{fact.label}</p>
                <p className="font-display font-bold text-white text-lg md:text-xl leading-tight">{fact.value}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={400}>
          <div className="mt-8 text-center">
            <span className="inline-block px-4 py-2 border border-yellow-500/30 bg-yellow-500/5 text-yellow-500/80 text-xs font-grotesk tracking-widest uppercase rounded-sm">
              Planned / Subject to Official Confirmation
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// WINNER OPPORTUNITIES SECTION
// ============================================================
const winnerCards = [
  { title: 'NATIONAL RECOGNITION', desc: 'Winners may be publicly recognized through the show\'s official media.' },
  { title: 'MASSIVE EXPOSURE', desc: 'Opportunity to have your story and participation seen by a large audience.' },
  { title: 'CONTENT OPPORTUNITIES', desc: 'Potential opportunities to appear in official THE SHOT content.' },
  { title: 'CREATOR OPPORTUNITIES', desc: 'Potential pathways to grow a personal audience and digital identity.' },
  { title: 'BRAND OPPORTUNITIES', desc: 'Potential future opportunities for collaborations, subject to eligibility and commercial arrangements.' },
  { title: 'CASH REWARDS', desc: 'Confirmed prize tiers will be displayed in the official prize section.' },
  { title: 'FUTURE ENTERTAINMENT OPPORTUNITIES', desc: 'Selected participants may potentially be considered for future THE SHOT formats or related entertainment opportunities.' },
];

export function WinnerSection() {
  return (
    <section id="opportunities" className="relative py-24 md:py-32 bg-black overflow-hidden">
      <div className="absolute inset-0 spotlight" />
      <div className="absolute top-0 left-0 w-1/2 h-full opacity-15 hidden lg:block">
        <img
          src="https://images.pexels.com/photos/35595102/pexels-photo-35595102.jpeg?auto=compress&cs=tinysrgb&w=940"
          alt="Crowd with hands raised in celebration"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.5) contrast(1.2)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black via-black/60 to-transparent" />
      </div>
      <div className="relative max-w-6xl mx-auto px-5">
        <Reveal>
          <p className="text-xs font-grotesk tracking-[0.3em] text-[#00ff88] uppercase mb-4 text-center">
            What Happens If You Make It?
          </p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="font-display font-black text-white text-center leading-none" style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)' }}>
            WHAT HAPPENS
            <br />
            <span className="text-[#00ff88]">IF YOU MAKE IT?</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {winnerCards.map((card, i) => (
            <Reveal key={card.title} delay={i * 80}>
              <div className="group h-full bg-gradient-to-b from-white/[0.03] to-transparent border border-white/10 rounded-xl p-6 transition-all duration-500 hover:border-[#00ff88]/30">
                <div className="w-10 h-10 rounded-full border border-[#00ff88]/30 flex items-center justify-center mb-5 transition-all duration-500 group-hover:bg-[#00ff88]/10">
                  <Trophy size={18} className="text-[#00ff88]" />
                </div>
                <h3 className="font-display font-bold text-white text-sm tracking-wider mb-3">{card.title}</h3>
                <p className="text-gray-400 font-grotesk text-sm leading-relaxed">{card.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={500}>
          <p className="mt-12 text-center text-xs text-gray-600 font-grotesk max-w-2xl mx-auto">
            These are potential opportunities, not guaranteed outcomes. THE SHOT does not guarantee
            fame, employment, brand deals, followers, celebrity status, future acting opportunities, or wealth.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// PRIZE SECTION
// ============================================================
export function PrizeSection() {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  useEffect(() => { getConfig().then(setConfig); }, []);

  if (config && !config.prizes_enabled) return null;
  const prizes: Prize[] = config?.prizes ?? [];

  return (
    <section id="prizes" className="relative py-24 md:py-32 bg-[#0a0a0a] overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#00ff88]/5 rounded-full blur-[120px]" />
      </div>
      <div className="absolute bottom-0 right-0 w-1/3 h-2/3 opacity-15 hidden md:block">
        <img
          src="https://images.pexels.com/photos/6532370/pexels-photo-6532370.jpeg?auto=compress&cs=tinysrgb&w=940"
          alt="Trophy and medal representing achievement"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.5) contrast(1.2)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
      </div>
      <div className="relative max-w-5xl mx-auto px-5">
        <Reveal>
          <h2 className="font-display font-bold text-white text-center leading-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}>
            THE SHOT ISN'T JUST ABOUT BEING SEEN.
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="mt-4 font-display font-bold text-[#00ff88] text-center text-2xl md:text-4xl tracking-wide">
            THERE'S SOMETHING TO PLAY FOR.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-5">
          {prizes.map((prize, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className={`relative group border rounded-xl p-8 transition-all duration-500 hover:scale-[1.02] ${
                prize.rank === 1
                  ? 'border-[#00ff88]/40 bg-gradient-to-b from-[#00ff88]/[0.08] to-transparent'
                  : 'border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent hover:border-[#00ff88]/20'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-grotesk tracking-[0.3em] text-gray-500 uppercase mb-2">
                      {prize.label}
                    </p>
                    <p className="font-display font-black text-white text-3xl md:text-5xl tracking-tight">
                      {prize.amount}
                    </p>
                    {prize.count > 1 && (
                      <p className="mt-2 text-sm text-gray-400 font-grotesk">
                        × {prize.count} winners
                      </p>
                    )}
                  </div>
                  {prize.rank === 1 && (
                    <div className="w-12 h-12 rounded-full bg-[#00ff88]/10 flex items-center justify-center">
                      <Trophy size={24} className="text-[#00ff88]" />
                    </div>
                  )}
                </div>
                {!prize.confirmed && (
                  <p className="mt-4 text-xs text-yellow-500/60 font-grotesk tracking-wider uppercase">
                    Planned / Subject to Official Confirmation
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={600}>
          <p className="mt-10 text-center text-xs text-gray-600 font-grotesk max-w-2xl mx-auto">
            Prize amounts and winner counts are configured by the admin and subject to official
            confirmation. Complete prize rules and eligibility apply.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// MEDIA / DISTRIBUTION SECTION
// ============================================================
export function MediaSection() {
  const platforms = [
    { name: 'YouTube', icon: Youtube, confirmed: true },
    { name: 'Instagram', icon: Instagram, confirmed: true },
    { name: 'Television', icon: Tv, confirmed: false },
    { name: 'ZEE5', icon: Tv, confirmed: false },
    { name: 'Netflix', icon: Tv, confirmed: false },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-black overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-30" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2/5 h-3/4 opacity-15 hidden lg:block">
        <img
          src="https://images.pexels.com/photos/23224702/pexels-photo-23224702.jpeg?auto=compress&cs=tinysrgb&w=940"
          alt="Young creator recording content at home"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.5) contrast(1.2)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black via-black/50 to-transparent" />
      </div>
      <div className="relative max-w-5xl mx-auto px-5">
        <Reveal>
          <h2 className="font-display font-bold text-white text-center leading-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}>
            FROM YOUR PHONE
            <br />
            <span className="text-[#00ff88]">TO THE BIG SCREEN.</span>
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-8 text-gray-400 font-grotesk text-center max-w-2xl mx-auto leading-relaxed">
            THE SHOT is being designed as a digital-first reality experience with the ambition
            to expand across major entertainment platforms.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-5 gap-4">
          {platforms.map((p, i) => (
            <Reveal key={p.name} delay={i * 100}>
              <div className={`relative border rounded-xl p-6 text-center transition-all duration-500 hover:scale-105 ${
                p.confirmed
                  ? 'border-white/10 bg-white/[0.03] hover:border-[#00ff88]/30'
                  : 'border-white/5 bg-white/[0.01] opacity-60'
              }`}>
                <p.icon size={32} className={`mx-auto mb-3 ${p.confirmed ? 'text-white' : 'text-gray-600'}`} />
                <p className={`font-display font-bold text-sm tracking-wider ${p.confirmed ? 'text-white' : 'text-gray-500'}`}>
                  {p.name}
                </p>
                {!p.confirmed && (
                  <p className="mt-2 text-[10px] text-yellow-500/50 font-grotesk tracking-wider uppercase">
                    Planned
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// MYSTERY SECTION
// ============================================================
const mysteryCards = [
  { title: 'THE CHALLENGES' },
  { title: 'THE NEXT STAGE' },
  { title: 'THE BIG REVEAL' },
  { title: 'THE FINAL SHOT' },
];

export function MysterySection() {
  return (
    <section className="relative py-24 md:py-32 bg-[#0a0a0a] overflow-hidden">
      <div className="absolute inset-0 spotlight" />
      <div className="relative max-w-5xl mx-auto px-5">
        <Reveal>
          <h2 className="font-display font-bold text-white text-center leading-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}>
            YOU DON'T KNOW
            <br />
            <span className="text-[#00ff88]">EVERYTHING YET.</span>
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-8 text-gray-400 font-grotesk text-center max-w-xl mx-auto">
            Some of THE SHOT will only make sense once you're inside.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-5">
          {mysteryCards.map((card, i) => (
            <Reveal key={card.title} delay={i * 100}>
              <div className="locked-card group relative h-48 border border-white/10 rounded-xl overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="w-14 h-14 rounded-full border-2 border-white/10 flex items-center justify-center transition-all duration-500 group-hover:border-[#00ff88] group-hover:scale-110">
                    <Lock size={24} className="text-gray-500 transition-colors duration-500 group-hover:text-[#00ff88]" />
                  </div>
                  <p className="font-display font-bold text-white text-lg tracking-widest">{card.title}</p>
                  <p className="text-xs font-grotesk tracking-[0.3em] text-gray-600 uppercase">Locked</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#00ff88]/0 to-transparent group-hover:from-[#00ff88]/5 transition-all duration-500" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// SCARCITY SECTION
// ============================================================
export function ScarcitySection() {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    getConfig().then(setConfig);
  }, []);

  useEffect(() => {
    if (!config?.registration_deadline) return;
    const update = () => {
      if (config.registration_deadline) {
        setCountdown(getCountdown(config.registration_deadline));
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [config]);

  return (
    <section className="relative py-24 md:py-32 bg-black overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/20993079/pexels-photo-20993079.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt=""
          className="w-full h-full object-cover opacity-10"
          style={{ filter: 'brightness(0.5) contrast(1.2)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-black" />
      </div>

      <div className="relative max-w-4xl mx-auto px-5 text-center">
        <Reveal>
          <h2 className="font-display font-bold text-white leading-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}>
            THIS OPPORTUNITY WON'T BE OPEN FOREVER.
          </h2>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-12 inline-block">
            <p className="text-xs font-grotesk tracking-[0.3em] text-[#00ff88] uppercase mb-4">Registration Window</p>
            <div className="flex items-center justify-center gap-4 md:gap-8">
              {[
                { label: 'Days', value: countdown.days },
                { label: 'Hours', value: countdown.hours },
                { label: 'Mins', value: countdown.minutes },
                { label: 'Secs', value: countdown.seconds },
              ].map((unit) => (
                <div key={unit.label} className="text-center">
                  <div className="font-display font-black text-white text-4xl md:text-6xl tabular-nums w-16 md:w-24">
                    {String(unit.value).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500 font-grotesk tracking-widest uppercase mt-2">{unit.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {config?.show_start_date && (
          <Reveal delay={300}>
            <p className="mt-12 text-sm font-grotesk tracking-[0.3em] text-gray-500 uppercase">
              The Experience Begins {formatDate(config.show_start_date)}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}

// ============================================================
// TRUST SECTION
// ============================================================
export function TrustSection() {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  useEffect(() => { getConfig().then(setConfig); }, []);

  const items = [
    { label: 'Eligibility', value: config?.eligibility_text ?? 'You must be 18 years or older and a resident of India to participate.' },
    { label: 'Registration Fee', value: `A registration fee of ${config?.registration_fee ?? '₹499'} is required to participate.` },
    { label: 'What Payment Means', value: 'Your payment confirms your registration and reserves your place in the experience.' },
    { label: 'Referral Requirements', value: `You must bring ${config?.referral_requirement ?? 2} eligible people through your personal referral link.` },
    { label: 'Deadline', value: `You must complete referral conditions by ${config ? formatDate(config.registration_deadline) : 'the stated deadline'}.` },
    { label: 'Refund Conditions', value: config?.refund_policy ?? 'Refunds are processed according to the published refund policy.' },
    { label: 'Competition Rules', value: 'Participants must follow all official rules and format guidelines throughout the experience.' },
    { label: 'Prize Conditions', value: 'Prizes are subject to official confirmation and winner selection rules.' },
    { label: 'Winner Selection', value: 'Winners are selected through the official format and judging process.' },
    { label: 'Media / Distribution', value: 'Planned distribution platforms are subject to official confirmation.' },
    { label: 'Privacy', value: 'Your information is handled according to our Privacy Policy.' },
    { label: 'Terms', value: 'Participation is subject to the official Terms & Conditions.' },
  ];

  return (
    <section id="trust" className="relative py-24 md:py-32 bg-[#0a0a0a] overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-30" />
      <div className="relative max-w-4xl mx-auto px-5">
        <Reveal>
          <p className="text-xs font-grotesk tracking-[0.3em] text-[#00ff88] uppercase mb-4 text-center">Transparency</p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="font-display font-bold text-white text-center" style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}>
            BEFORE YOU ENTER
          </h2>
        </Reveal>

        <div className="mt-16 space-y-1">
          {items.map((item, i) => (
            <Reveal key={item.label} delay={i * 50}>
              <div className="border-b border-white/5 py-5 flex flex-col md:flex-row gap-2 md:gap-8">
                <div className="md:w-48 flex-shrink-0">
                  <p className="font-display font-bold text-[#00ff88] text-sm tracking-wider uppercase">{item.label}</p>
                </div>
                <p className="text-gray-400 font-grotesk text-sm leading-relaxed flex-1">{item.value}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FINAL CTA SECTION
// ============================================================
export function FinalCtaSection({ onTakeShot }: { onTakeShot: () => void }) {
  return (
    <section className="relative py-32 md:py-40 bg-black overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00ff88]/3 rounded-full blur-[150px]" />
      </div>
      <div className="absolute inset-0 grid-overlay opacity-20" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 opacity-10 hidden md:block">
        <img
          src="https://images.pexels.com/photos/32399568/pexels-photo-32399568.jpeg?auto=compress&cs=tinysrgb&w=940"
          alt="Concert crowd enjoying music at night"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.4) contrast(1.2)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
      </div>

      <div className="relative max-w-4xl mx-auto px-5 text-center">
        <Reveal>
          <h2 className="font-display font-bold text-white leading-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 3.5rem)' }}>
            MAYBE YOU'VE BEEN WAITING
            <br />
            FOR YOUR MOMENT.
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-6 font-display font-bold text-[#00ff88] leading-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 3.5rem)' }}>
            MAYBE YOUR MOMENT HAS BEEN
            <br />
            WAITING FOR THE SHOT.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <h2 className="mt-12 font-display font-black text-white leading-none text-glow-green" style={{ fontSize: 'clamp(3rem, 10vw, 7rem)' }}>
            TAKE YOUR SHOT.
          </h2>
        </Reveal>
        <Reveal delay={400}>
          <button
            onClick={onTakeShot}
            className="mt-12 px-12 py-5 bg-[#00ff88] text-black font-display font-bold text-base tracking-widest uppercase rounded-sm hover:scale-105 transition-transform duration-300 pulse-glow"
          >
            Join The Shot
          </button>
        </Reveal>
        <Reveal delay={500}>
          <p className="mt-8 text-xs font-grotesk tracking-[0.3em] text-gray-500 uppercase">
            Register → Pay → Get Your Referral ID → Bring 2 → Share → Unlock
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// LIVE COUNTERS SECTION
// ============================================================
export function CountersSection() {
  return (
    <section className="relative py-20 md:py-28 bg-black border-y border-white/5 overflow-hidden">
      <div className="absolute inset-0 spotlight" />
      <div className="relative max-w-6xl mx-auto px-5">
        <LiveCounters />
      </div>
    </section>
  );
}

// ============================================================
// FOOTER
// ============================================================
export function Footer() {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  useEffect(() => { getConfig().then(setConfig); }, []);

  return (
    <footer className="relative bg-black border-t border-white/5 py-12 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-display font-black text-white text-lg tracking-[0.2em]">
              THE<span className="text-[#00ff88]">SHOT</span>
            </p>
            <p className="mt-2 text-xs text-gray-600 font-grotesk">An ambitious new social reality experience.</p>
          </div>
          <div className="flex items-center gap-6">
            {config?.social_instagram && (
              <a
                href={`https://instagram.com/${config.social_instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#00ff88] transition-colors"
              >
                <Instagram size={20} />
              </a>
            )}
            {config?.social_youtube && (
              <a
                href={config.social_youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#00ff88] transition-colors"
              >
                <Youtube size={20} />
              </a>
            )}
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-gray-700 font-grotesk">
            © 2026 THE SHOT. All rights reserved. Participation subject to official Terms & Conditions and Privacy Policy.
          </p>
        </div>
      </div>
    </footer>
  );
}
