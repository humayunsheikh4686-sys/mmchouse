import { getAdminClient } from './supabase';
import { DEFAULT_CONTENT } from './defaultContent';

export function normalizeContent(raw) {
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

export async function fetchSiteContent() {
  try {
    const client = getAdminClient();
    const { data, error } = await client.from('site_content').select('content').eq('id', 1).single();
    if (error || !data) {
      return normalizeContent(null);
    }
    return normalizeContent(data.content);
  } catch {
    return normalizeContent(null);
  }
}