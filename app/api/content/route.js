import { getAdminClient, getPublicClient } from '../../../lib/supabase';
import { DEFAULT_CONTENT } from '../../../lib/defaultContent';

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

function normalizeContent(raw) {
  const content = raw || {};
  return {
    ...DEFAULT_CONTENT,
    ...content,
    gallery: Array.isArray(content.gallery) ? content.gallery : [...DEFAULT_CONTENT.gallery],
    certifications: Array.isArray(content.certifications)
      ? content.certifications
      : [...DEFAULT_CONTENT.certifications],
  };
}

export async function GET() {
  try {
    const client = getPublicClient();
    const { data, error } = await client.from('site_content').select('content').eq('id', 1).single();

    if (error || !data) {
      return Response.json(normalizeContent(null));
    }

    return Response.json(normalizeContent(data.content));
  } catch (error) {
    console.error('Read content error:', error);
    return Response.json(normalizeContent(null));
  }
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = String(body.password || req.headers.get('x-admin-password') || '').trim();
    const expected = await getAdminPassword();

    if (!password || password !== expected) {
      return Response.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
    }

    const incoming = body.content;
    if (!incoming || typeof incoming !== 'object') {
      return Response.json({ ok: false, message: 'Content payload is required.' }, { status: 400 });
    }

    const { data: existing, error: readError } = await getAdminClient()
      .from('site_content')
      .select('content')
      .eq('id', 1)
      .single();
    const base = readError || !existing ? {} : existing.content || {};

    const merged = normalizeContent({
      ...base,
      ...incoming,
      gallery: Array.isArray(incoming.gallery) && incoming.gallery.length ? incoming.gallery : base.gallery,
      certifications:
        Array.isArray(incoming.certifications) && incoming.certifications.length
          ? incoming.certifications
          : base.certifications,
    });

    const { error } = await getAdminClient()
      .from('site_content')
      .upsert({ id: 1, content: merged, updated_at: new Date().toISOString() }, { onConflict: 'id' });

    if (error) {
      console.error('Save content error:', error);
      return Response.json({ ok: false, message: error.message || 'Unable to save content.' }, { status: 500 });
    }

    return Response.json({ ok: true, content: merged });
  } catch (error) {
    console.error('Save content error:', error);
    return Response.json({ ok: false, message: 'Unable to save content.' }, { status: 500 });
  }
}