import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { getConfig, type AdminConfig } from '@/lib/config';
import { animateNumber } from '@/lib/utils';

export function LiveCounters() {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [realCount, setRealCount] = useState<number>(0);
  const [displayed, setDisplayed] = useState<number>(0);
  const [animated, setAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const numberRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getConfig().then(setConfig);
  }, []);

  useEffect(() => {
    if (!config) return;
    if (config.social_proof_mode !== 'real') return;
    (async () => {
      const { count } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('payment_verified', true);
      setRealCount(count ?? 0);
    })();
  }, [config]);

  const targetNumber = config?.social_proof_mode === 'real' ? realCount : (config?.social_proof_number ?? 500000);
  const label = config?.social_proof_mode === 'real'
    ? 'PEOPLE HAVE JOINED THE SHOT'
    : (config?.social_proof_label ?? 'PEOPLE ARE WATCHING THE SHOT');

  // Animate when section enters viewport
  useEffect(() => {
    if (!config || animated) return;
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && numberRef.current) {
          setAnimated(true);
          animateNumber(numberRef.current, 0, targetNumber, 2500);
          setDisplayed(targetNumber);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [config, targetNumber, animated]);

  const displayValue = displayed >= 500000 ? `${displayed.toLocaleString('en-US')}+` : displayed.toLocaleString('en-US');

  return (
    <section ref={sectionRef} className="relative py-20 md:py-32 bg-black border-y border-white/5 overflow-hidden">
      <div className="absolute inset-0 spotlight" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00ff88]/5 rounded-full blur-[120px]" />
      <div className="relative max-w-4xl mx-auto px-5 text-center">
        <div
          ref={numberRef}
          className="font-display font-black text-white text-glow-green leading-none"
          style={{ fontSize: 'clamp(3rem, 12vw, 8rem)' }}
        >
          {displayValue}
        </div>
        <div className="mt-6 text-sm md:text-lg text-gray-400 font-grotesk tracking-[0.2em] uppercase">
          {label}
        </div>
      </div>
    </section>
  );
}
