'use client';

import { useState } from 'react';
import Reveal from './Reveal';
import ProjectModal from './ProjectModal';

const CATEGORIES = ['All', 'Cabin & Body', 'Electrical', 'Battery', 'Interior', 'Metal'];

export default function SectionGallery({ content }) {
  const [active, setActive] = useState('All');
  const [selected, setSelected] = useState(null);

  const items = Array.isArray(content.gallery) ? content.gallery : [];
  const filtered = items.filter((item) => active === 'All' || item.category === active);
  const selectedItem =
    selected !== null && items[selected] ? items[selected] : null;

  return (
    <section id="gallery" className="container">
      <Reveal>
        <div className="section-title">
          <h2>Our Work</h2>
          <p>Practical solutions for vehicle cabin, electrical, and custom interior needs.</p>
        </div>

        <div className="gallery-shell">
          <aside className="gallery-sidebar">
            <div className="sidebar-hint">Browse</div>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`filter-chip ${active === cat ? 'active' : ''}`}
                data-category={cat}
                onClick={() => setActive(cat)}
              >
                {cat === 'All'
                  ? 'All Work'
                  : cat === 'Metal'
                  ? 'Metal Work'
                  : cat.split(' & ')[0]}
              </button>
            ))}
          </aside>

          <div>
            {filtered.length === 0 ? (
              <p style={{ color: 'var(--muted)' }}>No work items in this category yet.</p>
            ) : (
              <div className="gallery-grid">
                {filtered.map((item, index) => {
                  const originalIndex = items.indexOf(item);
                  return (
                    <article className="card" key={`${item.title}-${originalIndex}`}>
                      <img src={item.image} alt={item.title} />
                      <div className="card-body">
                        <div className="meta">{item.category}</div>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                        <button
                          type="button"
                          className="open-btn"
                          onClick={() => setSelected(originalIndex)}
                        >
                          View details →
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Reveal>

      <ProjectModal item={selectedItem} onClose={() => setSelected(null)} />
    </section>
  );
}