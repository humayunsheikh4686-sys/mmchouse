import Reveal from './Reveal';

export default function SectionHero({ content }) {
  return (
    <section className="hero container">
      <div className="hero-grid">
        <Reveal>
          <span className="eyebrow">Auto Workshop & Fabrication</span>
          <h1>
            Premium <span>cabin, electrical, and metal fabrication</span> solutions for vehicles.
          </h1>
          <p>{content.heroText}</p>

          <div className="hero-actions">
            <a href="#gallery" className="btn">
              View Work
            </a>
            <a href="#contact" className="ghost-btn">
              Contact Us
            </a>
          </div>

          <div className="pill-row">
            <span className="pill">Mazda cabin support</span>
            <span className="pill">Electrical & wiring</span>
            <span className="pill">Interior & metal work</span>
          </div>
        </Reveal>

        <Reveal>
          <div className="hero-card">
            <h3>{content.name}</h3>
            <p className="tagline">{content.tagline}</p>
            <p className="subtext">{content.heroSubtext}</p>

            <div className="stat-grid">
              <div className="stat">
                <strong>{content.statOneValue}</strong>
                <span>{content.statOneLabel}</span>
              </div>
              <div className="stat">
                <strong>{content.statTwoValue}</strong>
                <span>{content.statTwoLabel}</span>
              </div>
              <div className="stat">
                <strong>{content.statThreeValue}</strong>
                <span>{content.statThreeLabel}</span>
              </div>
              <div className="stat">
                <strong>{content.statFourValue}</strong>
                <span>{content.statFourLabel}</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}