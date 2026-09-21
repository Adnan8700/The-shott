import { supabase } from './supabase';
import { DEFAULT_CONFIG, type AdminConfig } from './types';

export type { AdminConfig };

let cachedConfig: AdminConfig | null = null;
let fetchPromise: Promise<AdminConfig> | null = null;

export async function getConfig(): Promise<AdminConfig> {
  if (cachedConfig) return cachedConfig;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    const { data, error } = await supabase.from('admin_config').select('key, value');
    if (error) {
      fetchPromise = null;
      return DEFAULT_CONFIG;
    }
    const config = { ...DEFAULT_CONFIG } as unknown as Record<string, unknown>;
    for (const row of data ?? []) {
      config[row.key] = row.value;
    }
    const typedConfig = config as unknown as AdminConfig;
    cachedConfig = typedConfig;
    fetchPromise = null;
    return typedConfig;
  })();

  return fetchPromise;
}

export function clearConfigCache() {
  cachedConfig = null;
}

export async function getConfigValue<T>(key: string): Promise<T> {
  const { data } = await supabase
    .from('admin_config')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  return (data?.value as T) ?? (DEFAULT_CONFIG as unknown as Record<string, unknown>)[key] as T;
}
