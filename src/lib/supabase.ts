import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-url') &&
  !supabaseAnonKey.includes('your-anon-key')
);

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || !isSupabaseConfigured;

// Create Supabase client if configured, otherwise null for demo fallback
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * In-memory client rate-limiting tracker for consecutive failed login attempts
 * Locks out for 30 seconds after 5 failed attempts
 */
interface LockoutState {
  attempts: number;
  lockedUntil: number; // timestamp ms
}

const lockoutMap = new Map<string, LockoutState>();

export function checkRateLimitLockout(studentId: string): { locked: boolean; remainingSeconds: number } {
  const key = studentId.toUpperCase().trim();
  const state = lockoutMap.get(key);
  if (!state) return { locked: false, remainingSeconds: 0 };

  const now = Date.now();
  if (state.lockedUntil > now) {
    const remainingSeconds = Math.ceil((state.lockedUntil - now) / 1000);
    return { locked: true, remainingSeconds };
  }

  // Lockout expired
  if (state.lockedUntil > 0 && state.lockedUntil <= now) {
    lockoutMap.delete(key);
  }

  return { locked: false, remainingSeconds: 0 };
}

export function recordFailedAttempt(studentId: string): { locked: boolean; remainingSeconds: number } {
  const key = studentId.toUpperCase().trim();
  const state = lockoutMap.get(key) || { attempts: 0, lockedUntil: 0 };
  state.attempts += 1;

  if (state.attempts >= 5) {
    state.lockedUntil = Date.now() + 30 * 1000; // 30 seconds lockout
    lockoutMap.set(key, state);
    return { locked: true, remainingSeconds: 30 };
  }

  lockoutMap.set(key, state);
  return { locked: false, remainingSeconds: 0 };
}

export function clearFailedAttempts(studentId: string): void {
  lockoutMap.delete(studentId.toUpperCase().trim());
}
