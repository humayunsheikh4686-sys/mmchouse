#!/usr/bin/env node
/**
 * MMCH deployment diagnostic
 * --------------------------
 * Usage:
 *   node scripts/check-deploy.mjs https://your-vercel-app.vercel.app
 *   node scripts/check-deploy.mjs http://localhost:3000
 *
 * Runs, in order:
 *   1. GET  /api/content            -> public read (public/anonymous key)
 *   2. POST /api/login   (wrong pw) -> must be 401
 *   3. POST /api/login   (right pw) -> must be 200 ok
 *   4. POST /api/content (right pw, re-saving identical content) -> must be 200 ok
 *
 * Step 4 writes the *same* content back to Supabase (a no-op upsert),
 * so it validates the service-role write path without changing anything.
 */

const baseUrl = process.argv[2];
if (!baseUrl) {
  console.error('Usage: node scripts/check-deploy.mjs <base-url>');
  console.error('Example: node scripts/check-deploy.mjs https://mmchouse.vercel.app');
  process.exit(1);
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Humayun@Admin!2026';
const url = baseUrl.replace(/\/+$/, '');

function log(label, ok, detail) {
  const mark = ok ? 'PASS' : 'FAIL';
  console.log(`${ok ? '\x1b[32m' : '\x1b[31m'}[${mark}]\x1b[0m ${label}${detail ? `  ->  ${detail}` : ''}`);
}

async function get(path) {
  const res = await fetch(`${url}${path}`);
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

async function post(path, payload, extraHeaders = {}) {
  const res = await fetch(`${url}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

const results = [];

(async () => {
  console.log(`\nChecking deployment: ${url}\n`);

  // 1. Public read
  try {
    const { status, body } = await get('/api/content');
    const hasName = body && typeof body.name === 'string';
    const matches = hasName && body.name === 'Madina Mazda Cabin House';
    log(
      `GET /api/content (public read) [HTTP ${status}]`,
      status === 200 && hasName,
      hasName ? `got name: "${body.name}"` : (body && body.message) || 'no JSON body'
    );
    if (!matches && hasName) {
      log('  name check', false, 'content is not "Madina Mazda Cabin House" (may be defaults from another env)');
    }
    if (!hasName) return finish(false);
  } catch (e) {
    log('GET /api/content', false, `network error: ${e.message}`);
    return finish(false);
  }

  // 2. Login with wrong password
  try {
    const wrong = await post('/api/login', { password: 'totally-wrong' });
    log(
      `POST /api/login wrong password [HTTP ${wrong.status}]`,
      wrong.status === 401,
      `status=${wrong.status} body=${JSON.stringify(wrong.body)}`
    );
  } catch (e) {
    log('POST /api/login (wrong)', false, `network error: ${e.message}`);
    return finish(false);
  }

  // 3. Login with correct password
  try {
    const right = await post('/api/login', { password: ADMIN_PASSWORD });
    log(
      `POST /api/login correct password [HTTP ${right.status}]`,
      right.status === 200 && right.body && right.body.ok === true,
      `status=${right.status} body=${JSON.stringify(right.body)}`
    );
  } catch (e) {
    log('POST /api/login (correct)', false, `network error: ${e.message}`);
    return finish(false);
  }

  // 4. Save (write-back identical content) - validates service-role write path
  try {
    const { body: current } = await get('/api/content');
    const save = await post('/api/content', { content: current, password: ADMIN_PASSWORD });
    const okSave = save.status === 200 && save.body && save.body.ok === true;
    log(
      `POST /api/content save (service-role write) [HTTP ${save.status}]`,
      okSave,
      okSave ? 'content saved successfully' : (save.body && save.body.message) || `status=${save.status}`
    );
    results.push(okSave);
  } catch (e) {
    log('POST /api/content save', false, `network error: ${e.message}`);
    results.push(false);
  }

  return finish(results.every(Boolean) && results.length > 0);
})();

function finish(allOk) {
  console.log('');
  console.log(allOk ? '\x1b[32mAll checks passed.\x1b[0m' : '\x1b[31mSome checks failed - see details above.\x1b[0m');
  console.log('');
  process.exit(allOk ? 0 : 1);
}