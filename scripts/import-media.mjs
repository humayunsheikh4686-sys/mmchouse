#!/usr/bin/env node
/**
 * MMCH media importer
 * -------------------
 * Uploads every photo from a local media folder into the public `site-gallery`
 * Supabase Storage bucket and appends each as a NEW gallery item (existing items
 * are never modified). Categories/titles are assigned per file in the MAPPING
 * table below — adjust and re-run to tweak.
 *
 * Usage:
 *   node scripts/import-media.mjs "C:/path/to/mmch media"
 *
 * Env (from .env.local): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const MAPPING = {
  // filename (exact) -> { category, title }
  '1.jpeg': { category: 'Cabin & Body', title: 'Cabin & Body Work' },
  '2.jpg': { category: 'Cabin & Body', title: 'Cabin & Body Work' },
  '3.jpeg': { category: 'Interior', title: 'Interior Design Work' },
  '4.jpeg': { category: 'Interior', title: 'Interior Design Work' },
  '5.jpeg': { category: 'Electrical', title: 'Auto Electrical Work' },
  '6': { category: 'Electrical', title: 'Auto Electrical Work' },
  '7': { category: 'Battery', title: 'Battery Service' },
  'Fairco-Aluminium-windows-Tilt_Turn_External_Ajar.jpg': {
    category: 'Metal',
    title: 'Aluminium Tilt & Turn Window',
  },
  'images.jpeg': { category: 'Metal', title: 'Metal Fabrication Work' },
  'photo-1517524008697-84bbe3c3fd98.jpeg': {
    category: 'Metal',
    title: 'Metal Fabrication Work',
  },
  'photo-1619642751034-765dfdf7c58e.jpeg': {
    category: 'Metal',
    title: 'Metal Fabrication Work',
  },
};

const DESC_BY_CATEGORY = {
  'Cabin & Body': 'Professional cabin & body work for vehicle maintenance and customization.',
  Electrical: 'Professional electrical work for vehicle maintenance and customization.',
  Battery: 'Battery testing, replacement, and dependable power service.',
  Interior: 'Custom interior work for comfort and style.',
  Metal: 'Custom metal fabrication for doors, windows, and grills.',
};

const DETAIL_BY_CATEGORY = {
  'Cabin & Body':
    'This is one of our specialized cabin & body projects. We bring quality craftsmanship and attention to detail to every job.',
  Electrical:
    'This is one of our specialized electrical projects. We bring quality craftsmanship and attention to detail to every job.',
  Battery:
    'We handle battery-related vehicle issues with reliable checks and service support.',
  Interior:
    'This is one of our specialized interior projects. We bring quality craftsmanship and attention to detail to every job.',
  Metal:
    'This is one of our specialized metal projects. We bring quality craftsmanship and attention to detail to every job.',
};

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const folder = process.argv[2];

if (!url || !key) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  process.exit(1);
}
if (!folder) {
  console.error('Usage: node scripts/import-media.mjs "<folder path>"');
  process.exit(1);
}

const BUCKET = 'site-gallery';

async function upload(fileName, absPath) {
  const bytes = await readFile(absPath);
  const ext = fileName.toLowerCase().endsWith('.jpg') ? '.jpg' : '.jpeg';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
  const res = await fetch(`${url}/storage/v1/object/${BUCKET}/${safeName}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, apikey: key, 'Content-Type': 'image/jpeg' },
    body: new Uint8Array(bytes),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`upload ${fileName} failed HTTP ${res.status}: ${txt.slice(0, 200)}`);
  }
  return `${url}/storage/v1/object/public/${BUCKET}/${safeName}`;
}

async function getRow() {
  const res = await fetch(`${url}/rest/v1/site_content?id=eq.1&select=content`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`read failed HTTP ${res.status}`);
  const rows = await res.json();
  return rows[0].content;
}

async function upsert(content) {
  const res = await fetch(`${url}/rest/v1/site_content`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify({ id: 1, content, updated_at: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error(`upsert failed HTTP ${res.status}: ${await res.text()}`);
  const rows = await res.json();
  return rows[0].content;
}

const files = (await readdir(folder)).filter(
  (f) => f.toLowerCase().endsWith('.jpeg') || f.toLowerCase().endsWith('.jpg') || !f.includes('.')
);

console.log('Found files:', files.length);
const newItems = [];
for (const f of files) {
  const map = MAPPING[f] || { category: 'Other', title: 'Workshop Work' };
  const pubUrl = await upload(f, path.join(folder, f));
  newItems.push({
    title: map.title,
    category: map.category,
    description: DESC_BY_CATEGORY[map.category] || DESC_BY_CATEGORY['Cabin & Body'],
    image: pubUrl,
    detail: DETAIL_BY_CATEGORY[map.category] || DETAIL_BY_CATEGORY['Cabin & Body'],
  });
  console.log(`  uploaded ${f}  ->  ${map.category}  ->  ${pubUrl.slice(0, 70)}`);
}

const current = await getRow();
const gallery = Array.isArray(current.gallery) ? current.gallery : [];
const next = { ...current, gallery: [...gallery, ...newItems] };
await upsert(next);

console.log(`\nDone. gallery: ${gallery.length} -> ${next.gallery.length} items.`);
console.log('First 3 new image URLs (verification):');
newItems.slice(0, 3).forEach((i) => console.log('  ', i.image));
