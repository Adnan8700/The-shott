import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { getConfig, type AdminConfig } from '@/lib/config';
import type { ActivityLog } from '@/lib/types';

interface NotificationItem {
  message: string;
  city: string | null;
}

export function ActivityTicker() {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [realActivities, setRealActivities] = useState<NotificationItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getConfig().then(setConfig);
  }, []);

  // Fetch real activity if in real mode
  useEffect(() => {
    if (!config || config.activity_mode !== 'real') return;
    (async () => {
      const { data } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (data) {
        setRealActivities(data.map((log: ActivityLog) => ({
          message: log.message,
          city: log.city,
        })));
      }
    })();
  }, [config]);

  // Build the notification list based on mode
  let items: NotificationItem[] = [];
  if (config?.activity_mode === 'real') {
    items = realActivities;
  } else if (config?.activity_mode === 'campaign') {
    const cities = config.activity_cities.length > 0
      ? config.activity_cities
      : ['Mumbai', 'Delhi', 'Noida', 'Lucknow', 'Jaipur', 'Bengaluru', 'Hyderabad', 'Pune', 'Chandigarh', 'Kolkata', 'Ahmedabad', 'Ghaziabad', 'Meerut', 'Muzaffarnagar'];
    const messages = config.activity_messages.length > 0
      ? config.activity_messages
      : ['THE SHOT IS GETTING ATTENTION', 'Interest is growing', 'THE SHOT is being discovered', 'People are checking in'];
    // Generate 20 rotating items
    items = Array.from({ length: 20 }, (_, i) => ({
      message: messages[i % messages.length],
      city: cities[i % cities.length],
    }));
  }

  const frequency = (config?.activity_frequency ?? 5) * 1000;

  useEffect(() => {
    if (items.length === 0) return;

    const showNext = () => {
      setVisible(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        timerRef.current = setTimeout(() => {
          setCurrentIdx((prev) => (prev + 1) % items.length);
          showNext();
        }, 500);
      }, Math.max(3000, frequency - 500));
    };

    // Initial delay before first notification
    const initialTimer = setTimeout(showNext, 2000);
    return () => {
      clearTimeout(initialTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [items.length, frequency]);

  if (items.length === 0) return null;
  const current = items[currentIdx];
  if (!current) return null;

  return (
    <div className="fixed bottom-20 left-4 z-40 max-w-xs hidden sm:block pointer-events-none">
      <div
        key={currentIdx}
        className={`bg-black/80 backdrop-blur-md border border-white/10 rounded-lg px-4 py-3 flex items-center gap-3 transition-all duration-500 ${
          visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
        }`}
      >
        <div className="w-2 h-2 rounded-full bg-[#00ff88] pulse-glow flex-shrink-0" />
        <div>
          <p className="text-sm text-gray-300 font-grotesk leading-tight">{current.message}</p>
          {current.city && <p className="text-xs text-[#00ff88] font-grotesk mt-0.5">{current.city}</p>}
        </div>
      </div>
    </div>
  );
}
