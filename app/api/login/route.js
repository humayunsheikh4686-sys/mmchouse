import { getAdminClient } from '../../../lib/supabase';

const FALLBACK_PASSWORD = 'Humayun@Admin!2026';

async function getAdminPassword() {
  const envPassword = process.env.ADMIN_PASSWORD;
  if (envPassword) return envPassword;

  try {
    const client = getAdminClient();
    const { data, error } = await client.from('app_config').select('value').eq('key', 'admin_password').single();
    if (!error && data && data.value) return String(data.value);
  } catch {
    // fall through to default
  }

  return FALLBACK_PASSWORD;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = String(body.password || '').trim();
    const expected = await getAdminPassword();

    if (!password || password !== expected) {
      return Response.json({ ok: false, message: 'Invalid admin password.' }, { status: 401 });
    }

    return Response.json({ ok: true, message: 'Authorized admin access granted.' });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ ok: false, message: 'Unable to verify admin password.' }, { status: 500 });
  }
}