'use client';

import { useCallback, useRef, useState } from 'react';
import Nav from './Nav';
import SectionHero from './SectionHero';
import SectionAbout from './SectionAbout';
import SectionGallery from './SectionGallery';
import SectionBusinessInfo from './SectionBusinessInfo';
import SectionServices from './SectionServices';
import SectionContact from './SectionContact';
import Footer from './Footer';
import AdminPanel from './AdminPanel';

export default function SiteContent({ initialContent }) {
  const [content, setContent] = useState(initialContent);
  const [authenticated, setAuthenticated] = useState(false);
  const adminPanelRef = useRef(null);

  const handleAuthenticated = useCallback(() => {
    setAuthenticated(true);
  }, []);

  const handleContentChange = useCallback((next) => {
    setContent(next);
  }, []);

  const openAdmin = useCallback(() => {
    adminPanelRef.current?.openLogin();
  }, []);

  return (
    <>
      <Nav onEdit={openAdmin} />

      <main id="top">
        <SectionHero content={content} />
        <SectionAbout content={content} />
        <SectionGallery content={content} />
        <SectionBusinessInfo content={content} />
        <SectionServices content={content} />
        <SectionContact content={content} />
      </main>

      <Footer />

      <AdminPanel
        ref={adminPanelRef}
        content={content}
        onContentChange={handleContentChange}
        onAuthenticated={handleAuthenticated}
        isAuthenticated={authenticated}
      />
    </>
  );
}