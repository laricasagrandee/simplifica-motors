import { supabase } from '@/integrations/supabase/client';

const CACHE_KEY = 'fm:app-settings-cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CachedSettings {
  data: Record<string, string>;
  ts: number;
}

function getCached(): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedSettings = JSON.parse(raw);
    if (Date.now() - cached.ts > CACHE_TTL_MS) return null;
    return cached.data;
  } catch {
    return null;
  }
}

function setCache(data: Record<string, string>) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
}

/** Fetch a single app setting by key */
export async function getAppSetting(key: string): Promise<string | null> {
  // Try cache first
  const cached = getCached();
  if (cached && key in cached) return cached[key];

  const { data, error } = await (supabase as any)
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error || !data) return null;
  return data.value;
}

/** Fetch all app settings */
export async function getAllAppSettings(): Promise<Record<string, string>> {
  const cached = getCached();
  if (cached) return cached;

  const { data, error } = await (supabase as any)
    .from('app_settings')
    .select('key, value');

  if (error || !data) return {};

  const settings: Record<string, string> = {};
  for (const row of data) {
    settings[row.key] = row.value;
  }
  setCache(settings);
  return settings;
}

/** Update a setting (requires service role — called via edge function) */
export async function updateAppSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase.functions.invoke('admin-update-settings', {
    body: { key, value },
  });
  if (error) throw error;
  // Invalidate cache
  localStorage.removeItem(CACHE_KEY);
}
