export default function Nav({ onEdit }) {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <a href="#top" className="brand" aria-label="Madina Mazda Cabin House home">
          <img src="/Logo.png" alt="Madina Mazda Cabin House logo" className="brand-logo" />
        </a>

        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#gallery">Gallery</a>
          <a href="#certifications">Services</a>
          <a href="#contact">Contact</a>
          <button type="button" onClick={onEdit}>
            Edit Content
          </button>
        </div>
      </div>
    </nav>
  );
}