'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

const AdminPanel = forwardRef(function AdminPanel(
  { content, onContentChange, onAuthenticated, isAuthenticated },
  ref
) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(null);
  const authPasswordRef = useRef('');

  function openLogin() {
    if (isAuthenticated) {
      openEditor();
      return;
    }
    setError('');
    setPassword('');
    setLoginOpen(true);
  }

  useImperativeHandle(ref, () => ({
    openLogin() {
      openLogin();
    },
  }));

  function openEditor() {
    setDraft(structuredClone(content));
    setError('');
    setEditorOpen(true);
  }

  function closeLogin() {
    setLoginOpen(false);
    setPassword('');
    setError('');
  }

  function closeEditor() {
    setEditorOpen(false);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || 'Invalid admin password.');
        return;
      }
      onAuthenticated();
      authPasswordRef.current = password;
      closeLogin();
      openEditor();
    } catch {
      setError('Unable to verify password. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: draft, password: authPasswordRef.current }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || 'Unable to save content.');
        return;
      }
      onContentChange(data.content);
      closeEditor();
    } catch {
      setError('Unable to save the changes. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function updateField(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function updateGalleryItem(index, key, value) {
    setDraft((prev) => {
      const gallery = (prev.gallery || []).map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      );
      return { ...prev, gallery };
    });
  }

  function addGalleryItem() {
    setDraft((prev) => ({
      ...prev,
      gallery: [
        ...(prev.gallery || []),
        {
          title: 'New Workshop Item',
          category: 'Cabin & Body',
          description: 'Add your latest workshop work here.',
          image:
            'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80',
          detail: 'Describe the work in more detail here.',
        },
      ],
    }));
  }

  function removeGalleryItem(index) {
    setDraft((prev) => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_, i) => i !== index),
    }));
  }

  function updateCertItem(index, key, value) {
    setDraft((prev) => {
      const certifications = (prev.certifications || []).map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      );
      return { ...prev, certifications };
    });
  }

  function addCertItem() {
    setDraft((prev) => ({
      ...prev,
      certifications: [
        ...(prev.certifications || []),
        { title: 'New Service', subtitle: 'Add your next workshop solution', link: '#' },
      ],
    }));
  }

  function removeCertItem(index) {
    setDraft((prev) => ({
      ...prev,
      certifications: (prev.certifications || []).filter((_, i) => i !== index),
    }));
  }

  const stats = [
    ['statOneValue', 'Stat 1 Value'],
    ['statOneLabel', 'Stat 1 Label'],
    ['statTwoValue', 'Stat 2 Value'],
    ['statTwoLabel', 'Stat 2 Label'],
    ['statThreeValue', 'Stat 3 Value'],
    ['statThreeLabel', 'Stat 3 Label'],
    ['statFourValue', 'Stat 4 Value'],
    ['statFourLabel', 'Stat 4 Label'],
  ];

  const galleryCategories = ['Cabin & Body', 'Electrical', 'Battery', 'Interior', 'Metal', 'Other'];

  return (
    <>
      <button className="fab-btn" type="button" aria-label="Edit content" onClick={openLogin}>
        ✎
      </button>

      {loginOpen && (
        <div className="modal open">
          <div className="modal-panel">
            <h3>Admin Login</h3>
            <p>Enter the admin password to manage website content securely.</p>
            <form onSubmit={handleLogin}>
              <div className="field">
                <label htmlFor="adminPassword">Password</label>
                <input
                  id="adminPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p style={{ color: '#ff8fa3' }}>{error}</p>}
              <div className="editor-footer">
                <button type="button" className="ghost-btn" onClick={closeLogin}>
                  Close
                </button>
                <button type="submit" className="btn" disabled={busy}>
                  {busy ? 'Verifying…' : 'Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editorOpen && draft && (
        <div className="modal open">
          <div className="modal-panel" style={{ maxHeight: '90vh', overflow: 'auto' }}>
            <h3>Company Profile Editor</h3>
            <p>
              Update the service details, gallery, and contact information. Changes are saved in the
              database.
            </p>

            <form onSubmit={handleSave}>
              <div className="row">
                <div className="field">
                  <label>Name</label>
                  <input
                    value={draft.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Tagline</label>
                  <input
                    value={draft.tagline || ''}
                    onChange={(e) => updateField('tagline', e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label>Hero Intro</label>
                <textarea
                  value={draft.heroText || ''}
                  onChange={(e) => updateField('heroText', e.target.value)}
                />
              </div>

              <div className="field">
                <label>Hero Supporting Text</label>
                <textarea
                  value={draft.heroSubtext || ''}
                  onChange={(e) => updateField('heroSubtext', e.target.value)}
                />
              </div>

              <div className="field">
                <label>About Text</label>
                <textarea
                  value={draft.aboutText || ''}
                  onChange={(e) => updateField('aboutText', e.target.value)}
                />
              </div>

              <div className="row">
                <div className="field">
                  <label>Contact Email</label>
                  <input
                    value={draft.contactEmail || ''}
                    onChange={(e) => updateField('contactEmail', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Contact Message</label>
                  <input
                    value={draft.contactText || ''}
                    onChange={(e) => updateField('contactText', e.target.value)}
                  />
                </div>
              </div>

              <div className="row">
                <div className="field">
                  <label>Business Info Text</label>
                  <textarea
                    value={draft.cvText || ''}
                    onChange={(e) => updateField('cvText', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Current Focus</label>
                  <textarea
                    value={draft.cvStatus || ''}
                    onChange={(e) => updateField('cvStatus', e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {stats.map(([key, label]) => (
                  <div className="field" key={key}>
                    <label>{label}</label>
                    <input
                      value={draft[key] || ''}
                      onChange={(e) => updateField(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="field">
                <label>Gallery</label>
                {(draft.gallery || []).map((item, index) => (
                  <div className="mini-card" key={index}>
                    <div className="field">
                      <label>Title</label>
                      <input
                        value={item.title || ''}
                        onChange={(e) => updateGalleryItem(index, 'title', e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Category</label>
                      <select
                        value={item.category || ''}
                        onChange={(e) => updateGalleryItem(index, 'category', e.target.value)}
                      >
                        {galleryCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label>Description</label>
                      <textarea
                        value={item.description || ''}
                        onChange={(e) => updateGalleryItem(index, 'description', e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Image URL</label>
                      <input
                        value={item.image || ''}
                        onChange={(e) => updateGalleryItem(index, 'image', e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Detail</label>
                      <textarea
                        value={item.detail || ''}
                        onChange={(e) => updateGalleryItem(index, 'detail', e.target.value)}
                      />
                    </div>
                    <div className="mini-actions">
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={() => removeGalleryItem(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="ghost-btn"
                  style={{ marginTop: '10px' }}
                  onClick={addGalleryItem}
                >
                  Add Work Item
                </button>
              </div>

              <div className="field">
                <label>Service Categories</label>
                {(draft.certifications || []).map((cert, index) => (
                  <div className="mini-card" key={index}>
                    <div className="field">
                      <label>Title</label>
                      <input
                        value={cert.title || ''}
                        onChange={(e) => updateCertItem(index, 'title', e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Subtitle</label>
                      <input
                        value={cert.subtitle || ''}
                        onChange={(e) => updateCertItem(index, 'subtitle', e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Link</label>
                      <input
                        value={cert.link || ''}
                        onChange={(e) => updateCertItem(index, 'link', e.target.value)}
                      />
                    </div>
                    <div className="mini-actions">
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={() => removeCertItem(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="ghost-btn"
                  style={{ marginTop: '10px' }}
                  onClick={addCertItem}
                >
                  Add Service
                </button>
              </div>

              {error && <p style={{ color: '#ff8fa3' }}>{error}</p>}

              <div className="editor-footer">
                <button type="button" className="ghost-btn" onClick={closeEditor}>
                  Close
                </button>
                <button type="submit" className="btn" disabled={busy}>
                  {busy ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
});

export default AdminPanel;