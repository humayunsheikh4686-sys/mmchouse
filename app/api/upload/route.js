import { getAdminClient } from '../../../lib/supabase';

export const runtime = 'nodejs';

const BUCKET = 'site-gallery';

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get('file');

    if (!file || typeof file === 'string') {
      return Response.json({ ok: false, message: 'No file received.' }, { status: 400 });
    }

    const originalName = file.name || 'image.jpg';
    const ext = (originalName.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'].includes(ext) ? ext : 'jpg';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExt}`;

    const bytes = new Uint8Array(await file.arrayBuffer());

    const client = getAdminClient();

    const { error: bucketError } = await client.storage.createBucket(BUCKET, {
      public: true,
    });
    if (bucketError && bucketError.message && !bucketError.message.includes('already exists')) {
      console.error('Create bucket error:', bucketError);
    }

    const { data, error } = await client.storage.from(BUCKET).upload(name, bytes, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    });

    if (error) {
      console.error('Storage upload error:', error);
      return Response.json({ ok: false, message: error.message || 'Upload failed.' }, { status: 500 });
    }

    const url = `${process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${data.path}`;
    return Response.json({ ok: true, url });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ ok: false, message: error?.message || 'Upload failed.' }, { status: 500 });
  }
}