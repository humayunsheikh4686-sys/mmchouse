import Reveal from './Reveal';

export default function SectionBusinessInfo({ content }) {
  return (
    <section id="cv" className="container">
      <Reveal>
        <div className="section-title">
          <h2>Business Information</h2>
          <p>Reliable support for cabin, electrical, and fabrication work.</p>
        </div>

        <div className="cv-card">
          <div>
            <h3>Workshop Details</h3>
            <p>{content.cvText}</p>
            <div className="hero-actions">
              <a href={content.cvFile || '#contact'} className="btn">
                Contact Workshop
              </a>
            </div>
          </div>

          <div className="panel">
            <h3>Current Focus</h3>
            <p>{content.cvStatus}</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}