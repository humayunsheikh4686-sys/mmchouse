import { fetchSiteContent } from '../lib/content';
import SiteContent from './components/SiteContent';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const content = await fetchSiteContent();
  return <SiteContent initialContent={content} />;
}