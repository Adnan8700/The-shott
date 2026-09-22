import { useState, useEffect, useCallback } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'register'; ref?: string }
  | { name: 'payment'; participantId?: string }
  | { name: 'thankyou'; participantId?: string }
  | { name: 'dashboard'; participantId?: string }
  | { name: 'login'; participantId?: string }
  | { name: 'admin' };

function parseHash(): Route {
  const hash = window.location.hash.slice(1) || '/';
  const [path, queryString] = hash.split('?');
  const params = new URLSearchParams(queryString || '');
  const segments = path.split('/').filter(Boolean);

  if (segments.length === 0) return { name: 'home' };
  if (segments[0] === 'register') return { name: 'register', ref: params.get('ref') || undefined };
  if (segments[0] === 'payment')
    return { name: 'payment', participantId: params.get('pid') || undefined };
  if (segments[0] === 'thankyou')
    return { name: 'thankyou', participantId: params.get('pid') || undefined };
  if (segments[0] === 'dashboard')
    return { name: 'dashboard', participantId: params.get('pid') || undefined };
  if (segments[0] === 'login')
    return { name: 'login', participantId: params.get('pid') || undefined };
  if (segments[0] === 'admin') return { name: 'admin' };
  return { name: 'home' };
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const handler = () => {
      setRoute(parseHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = useCallback((path: string) => {
    window.location.hash = path;
  }, []);

  return { route, navigate };
}

export function buildPath(path: string, params?: Record<string, string>): string {
  if (!params) return path;
  const query = new URLSearchParams(params).toString();
  return `${path}?${query}`;
}
