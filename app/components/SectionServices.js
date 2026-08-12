import Reveal from './Reveal';

export default function SectionServices({ content }) {
  const certs = Array.isArray(content.certifications) ? content.certifications : [];

  return (
    <section id="certifications" className="container">
      <Reveal>
        <div className="section-title">
          <h2>Service Categories</h2>
          <p>Focused workshop offerings designed around vehicle care and fabrication.</p>
        </div>

        <div className="cert-grid">
          {certs.map((cert, index) => (
            <div className="cert-card" key={`${cert.title}-${index}`}>
              <div className="icon">✓</div>
              <h3>{cert.title}</h3>
              <p>{cert.subtitle}</p>
              <a href={cert.link || '#'} target="_blank" rel="noreferrer">
                Open service →
              </a>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}