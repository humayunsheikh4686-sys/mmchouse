import Reveal from './Reveal';

export default function SectionContact({ content }) {
  const emailLink = content.contactEmail ? `mailto:${content.contactEmail}` : '#';

  return (
    <section id="contact" className="container">
      <Reveal>
        <div className="contact-box">
          <h2>Visit or contact us for your next workshop requirement.</h2>
          <p>{content.contactText}</p>

          <div className="contact-grid">
            <div className="contact-item">
              <strong>M. Sudheer</strong>
              <a href="tel:03212181430" style={{ color: '#edf3ff' }}>
                0321-2181430
              </a>
            </div>

            <div className="contact-item">
              <strong>Sheikh Waqas</strong>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a href="https://wa.me/923102377333" target="_blank" rel="noreferrer" style={{ color: '#edf3ff' }}>
                  0310-2377333
                </a>
                <a href="https://wa.me/923212771409" target="_blank" rel="noreferrer" style={{ color: '#edf3ff' }}>
                  0321-2771409
                </a>
              </div>
            </div>
          </div>

          <div className="social-links">
            <a href="#top" aria-label="Back to top">
              ↑
            </a>
            <a href={emailLink} aria-label={content.contactEmail || 'Contact email'} title={content.contactEmail || 'Contact email'}>
              ✉
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}