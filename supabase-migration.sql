-- MMCH optional migration: relax RLS on site_content so the static site can read,
-- and so a password-gated admin flow can write even without a Supabase Auth session.
-- (The Next.js server uses the service-role key, which bypasses RLS entirely, so this
-- is only needed if you want the browser anon key to be able to write too.)

-- Keep/ensure public read access (anyone can view the site content)
DROP POLICY IF EXISTS "Allow public select" ON public.site_content;
CREATE POLICY "Allow public select" ON public.site_content
  FOR SELECT
  USING (true);

-- Allow the anon role to INSERT/UPDATE the single site content row (id = 1)
DROP POLICY IF EXISTS "Allow anon write" ON public.site_content;
CREATE POLICY "Allow anon write" ON public.site_content
  FOR INSERT, UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow authenticated Supabase-Auth users to write as well (existing behavior)
DROP POLICY IF EXISTS "Allow authenticated write" ON public.site_content;
CREATE POLICY "Allow authenticated write" ON public.site_content
  FOR INSERT, UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Note: writes sent from the Next.js /api/content route use the service-role key and
-- are never subject to these policies.