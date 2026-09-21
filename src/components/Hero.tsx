import { useEffect, useState } from 'react';
import { ParticleField } from './ParticleField';
import { getConfig, type AdminConfig } from '@/lib/config';
import { formatDate } from '@/lib/utils';

const HERO_IMAGE =
  'https://images.pexels.com/photos/33625502/pexels-photo-33625502.jpeg?auto=compress&cs=tinysrgb&w=1920';

export function Hero({ onTakeShot }: { onTakeShot: () => void }) {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    getConfig().then(setConfig);
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const scrollToExperience = () => {
    const el = document.getElementById('experience');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-cinematic flex items-center justify-center">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt=""
          className="w-full h-full object-cover slow-zoom"
          style={{ filter: 'brightness(0.35) contrast(1.1) saturate(0.7)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />
        <div className="absolute inset-0 spotlight" />
        <div className="absolute inset-0 grid-overlay opacity-50" />
        <div className="noise-overlay" />
      </div>

      {/* Particles */}
      <ParticleField />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 text-center pt-20 pb-32 md:pb-0">
        {/* Small label */}
        <div
          className={`flex items-center justify-center gap-3 mb-8 transition-all duration-1000 ${
            mounted ? 'opacity-100' : 'opacity-0 -translate-y-4'
          }`}
        >
          <div className="h-px w-12 bg-[#00ff88]/50" />
          <span className="text-xs font-grotesk tracking-[0.3em] text-[#00ff88] uppercase">
            {config?.registration_open ? 'Registration Now Open' : 'Registration Closed'}
          </span>
          <div className="h-px w-12 bg-[#00ff88]/50" />
        </div>

        {/* Main title */}
        <h1
          className={`font-display font-black text-white leading-none tracking-tight transition-all duration-1000 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ fontSize: 'clamp(3.5rem, 12vw, 9rem)' }}
        >
          THE<span className="text-[#00ff88] text-glow-green">SHOT</span>
        </h1>

        {/* Primary headline */}
        <p
          className={`mt-8 font-display font-bold text-white leading-tight tracking-wide transition-all duration-1000 delay-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ fontSize: 'clamp(1.1rem, 3vw, 2rem)' }}
        >
          WHAT IF YOU DIDN'T HAVE TO BE FAMOUS FIRST?
        </p>

        {/* Secondary */}
        <p
          className={`mt-3 font-display font-bold text-[#00ff88] leading-tight tracking-wide transition-all duration-1000 delay-300 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ fontSize: 'clamp(1.1rem, 3vw, 2rem)' }}
        >
          WHAT IF YOU WERE GIVEN YOUR SHOT?
        </p>

        {/* Supporting copy */}
        <p
          className={`mt-8 text-gray-400 font-grotesk max-w-2xl mx-auto leading-relaxed transition-all duration-1000 delay-500 ${
            mounted ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.05rem)' }}
        >
          THE SHOT is a new social reality experience designed for ordinary people
          who believe they were meant for more.
        </p>

        {/* Bold statements */}
        <div
          className={`mt-8 space-y-1 transition-all duration-1000 delay-700 ${
            mounted ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="font-display font-bold text-white text-sm md:text-base tracking-widest">
            NO FAMOUS SURNAME.
          </p>
          <p className="font-display font-bold text-white text-sm md:text-base tracking-widest">
            NO MILLION FOLLOWERS.
          </p>
          <p className="font-display font-bold text-white text-sm md:text-base tracking-widest">
            NO INDUSTRY CONNECTION REQUIRED.
          </p>
        </div>

        {/* CTAs */}
        <div
          className={`mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 delay-1000 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <button
            onClick={onTakeShot}
            className="group relative px-10 py-4 bg-[#00ff88] text-black font-display font-bold text-sm tracking-widest uppercase rounded-sm overflow-hidden transition-all duration-300 hover:scale-105 pulse-glow"
          >
            <span className="relative z-10">Take Your Shot</span>
          </button>
          <button
            onClick={scrollToExperience}
            className="px-10 py-4 border border-white/20 text-white font-display font-bold text-sm tracking-widest uppercase rounded-sm hover:border-[#00ff88] hover:text-[#00ff88] transition-all duration-300"
          >
            Discover The Experience
          </button>
        </div>

        {/* Date */}
        {config?.show_start_date && (
          <div
            className={`mt-10 transition-all duration-1000 delay-1200 ${
              mounted ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <p className="text-xs font-grotesk tracking-[0.3em] text-gray-500 uppercase">
              The Experience Begins {formatDate(config.show_start_date)}
            </p>
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-1000 ${
          mounted ? 'opacity-50' : 'opacity-0'
        }`}
      >
        <div className="w-px h-12 bg-gradient-to-b from-[#00ff88] to-transparent" />
      </div>
    </section>
  );
}
