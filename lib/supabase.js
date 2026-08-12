import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let adminClient = null;
let publicClient = null;

export function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment.');
  }
  if (!adminClient) {
    adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}

export function getPublicClient() {
  if (!supabaseUrl || !anonKey) {
    throw new Error('SUPABASE_URL and a publishable key must be set in the environment.');
  }
  if (!publicClient) {
    publicClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return publicClient;
}

export function hasSupabase() {
  return Boolean(supabaseUrl && (anonKey || serviceRoleKey));
}