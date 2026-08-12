import Reveal from './Reveal';

export default function SectionAbout({ content }) {
  return (
    <section id="about" className="container">
      <Reveal>
        <div className="section-title">
          <h2>About Us</h2>
          <p>Focused automotive services with practical workshop solutions.</p>
        </div>

        <div className="about-grid">
          <div className="panel">
            <h3>Company Profile</h3>
            <p>{content.aboutText}</p>
          </div>

          <div className="panel">
            <h3>Core Services</h3>
            <ul>
              <li>Cabin and body work for Mazda vehicles</li>
              <li>Car electrical work, wiring, and battery service</li>
              <li>Seat cushion and interior design upgrades</li>
              <li>Metal fabrication for doors, windows, and grills</li>
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  );
}