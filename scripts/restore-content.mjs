#!/usr/bin/env node
/**
 * MMCH content repair
 * -------------------
 * Repairs the `site_content` row (id = 1) that was clobbered by a direct DB edit.
 * After the mishap the row only contained { name, tagline, gallery, categories },
 * so every other field silently fell back to defaults. Also the stray `categories`
 * key is dropped (the app uses per-item gallery `category` + `certifications`).
 *
 * Safe: reads current row (service-role, bypasses RLS), merges DEFAULT_CONTENT in,
 * keeps the existing 15 gallery items untouched, then upserts the repaired object.
 *
 * Usage:
 *   node scripts/restore-content.mjs
 *
 * Uses the same env vars as `.env.local`:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { readFile } from 'node:fs/promises';

const DEFAULT_CONTENT_SOURCE = await readFile(
  new URL('../lib/defaultContent.js', import.meta.url),
  'utf8'
);
const defaultContentModule = await import(
  `data:text/javascript;base64,${Buffer.from(DEFAULT_CONTENT_SOURCE).toString('base64')}`
);

const DEFAULT_CONTENT = defaultContentModule.DEFAULT_CONTENT;
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  process.exit(1);
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

async function getRow() {
  const res = await fetch(`${url}/rest/v1/site_content?id=eq.1&select=id,updated_at,content`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`read failed HTTP ${res.status}: ${await res.text()}`);
  const rows = await res.json();
  if (!Array.isArray(rows) || !rows[0]) throw new Error('row id=1 not found');
  return rows[0];
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
    body: JSON.stringify({
      id: 1,
      content,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!res.ok) throw new Error(`upsert failed HTTP ${res.status}: ${await res.text()}`);
  const rows = await res.json();
  if (!Array.isArray(rows) || !rows[0]) throw new Error('upsert returned no row');
  return rows[0];
}

const row = await getRow();
const before = row.content;

if ('categories' in before) {
  console.log('Dropping stray "categories" key from content.');
}

const repaired = normalizeContent(before);
delete repaired.categories;

console.log('before keys:', Object.keys(before).join(', '));
console.log('repaired keys:', Object.keys(repaired).join(', '));
console.log('gallery items (kept):', repaired.gallery.length);
console.log('certifications (from defaults):', repaired.certifications.length);

const after = await upsert(repaired);
console.log('Upserted row. updated_at now:', after.updated_at);
console.log('DB gallery count after:', after.content.gallery.length);
console.log('OK');