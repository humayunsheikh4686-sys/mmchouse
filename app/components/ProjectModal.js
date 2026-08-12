'use client';

export default function ProjectModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="modal open" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <img
          src={item.image}
          alt={item.title}
          style={{
            borderRadius: '18px',
            aspectRatio: '4/3',
            objectFit: 'cover',
            marginBottom: '14px',
          }}
        />
        <h3>{item.title}</h3>
        <p>{item.detail}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button type="button" className="ghost-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}