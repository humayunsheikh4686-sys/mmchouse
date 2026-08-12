# Madina Mazda Cabin House (MMCH)

Next.js portfolio site for **Madina Mazda Cabin House** — an automotive workshop in Karachi
specializing in Mazda cabin work, auto electrical, wiring, battery service, cushion fitting,
interior design, and metal fabrication.

This is a full Next.js (App Router) rebuild of the original static site, deployed on
**Vercel**, with content stored in **Supabase** so the business owner can edit the live site
from the browser.

## Features

- Portfolio single-page site (hero, about, gallery with category filters, business info,
  service categories, contact) — SSR per request so changes appear live immediately
- **Edit Content** button (nav) + floating ✎ button for admins
- Password-protected admin login (`Humayun@Admin!2026` by default, overridable server-side)
- In-page editor to update text, stats, gallery items, and service categories
- Saving upserts content into Supabase `site_content` (row id = 1) via the service-role key
- Content is also readable publicly via `GET /api/content`

## Tech stack

- Next.js 15 (React 19, App Router)
- @supabase/supabase-js

## Environment variables (`.env.local`)

Create a `.env.local` and fill in the values (copy structure from the values below):

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable anon key>
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role key — server only, never exposed to the browser>
ADMIN_PASSWORD=Humayun@Admin!2026
```

> ⚠️ The service-role key must **only** ever run on the server. It is used by
> `app/api/content/route.js` and `app/api/login/route.js`.

## Supabase database

Run `supabase-setup.sql` (from the parent project) or this SQL:

```sql
CREATE TABLE IF NOT EXISTS public.site_content (
  id integer PRIMARY KEY,
  content jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.site_content (id, content)
VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
```

Then run `supabase-migration.sql` to ensure RLS allows public reads and (optionally) anon writes.
The Next.js server's service-role client bypasses RLS for writes regardless.

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build for production

```bash
npm run build
npm run start
```

## Deploy to Vercel

1. Push this folder (`MMCH/`) to a GitHub repo, e.g. `https://github.com/humayunsheikh4686-sys/mmch-shop`.
2. On Vercel: **Add New Project → Import `mmch-shop`**.
3. Set the **Root Directory** to `MMCH`.
4. Add the five environment variables from `.env.local` (both Preview and Production).
5. Deploy. The live site is served at your Vercel URL.

### To change the admin password

Set a different `ADMIN_PASSWORD` in Vercel env vars (and `.env.local`). If you prefer the
database-backed password, insert `app_config` (`key='admin_password'`) and it takes precedence.

## API routes

- `GET /api/content` — returns normalized site content (public)
- `POST /api/content` — body `{ content, password }`; saves when password matches
- `POST /api/login` — body `{ password }`; returns `{ ok: true }` when correct

## Security notes

- The admin password and service-role key never ship to the browser.
- The password is transmitted over HTTPS to the server on each login/save.
- For stricter control, restrict RLS or switch to Supabase Auth; see `supabase-migration.sql`.