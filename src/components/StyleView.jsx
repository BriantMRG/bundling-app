import React, { useState, useEffect } from 'react';

function showSnackbar(msg) {
  const el = document.getElementById('snackbar');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

function normalizePattern(raw) {
  return raw
    .split(/[,\s]+/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => p[0].toUpperCase() + p.slice(1).toLowerCase())
    .join(', ');
}

export default function StyleView() {
  const [styles, setStyles]       = useState([]);
  const [editing, setEditing]     = useState(null);
  const [styleNumber, setStyleNumber] = useState('');
  const [pattern, setPattern]     = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => { loadStyles(); }, []);

  async function loadStyles() {
    const data = await window.api.getStyles();
    setStyles(data);
  }

  function startEdit(style) {
    setEditing(style.id);
    setStyleNumber(style.styleNumber);
    setPattern(style.pattern);
    setDescription(style.description);
  }

  function cancelEdit() {
    setEditing(null);
    setStyleNumber('');
    setPattern('');
    setDescription('');
  }

  async function saveEdit() {
    if (!styleNumber) {
      showSnackbar('Style# must be entered');
      return;
    }
    if (!/^[0-9]+$/.test(styleNumber)) {
      showSnackbar('Style# must be numeric');
      return;
    }

    await window.api.updateStyle({
      id: editing,
      styleNumber: styleNumber.trim(),
      pattern: normalizePattern(pattern),
      description: description.trim(),
    });

    showSnackbar('Style updated successfully');
    cancelEdit();
    loadStyles();
  }

  async function handleDelete(id) {
    await window.api.deleteStyle(id);
    showSnackbar('Style deleted');
    loadStyles();
  }

  if (styles.length === 0) {
    return <p style={{ color: '#888' }}>No styles available.</p>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Style View</h2>

      {styles.map(style => (
        <div className="list-item" key={style.id}>
          {editing === style.id ? (
            <div style={{ flex: 1 }}>
              <label>Style#</label>
              <input
                type="number"
                value={styleNumber}
                onChange={e => setStyleNumber(e.target.value)}
              />
              <label>Pattern</label>
              <input
                type="text"
                value={pattern}
                onChange={e => setPattern(e.target.value)}
              />
              <label>Description</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
              <div style={{ marginTop: 8 }}>
                <button className="btn btn-primary" onClick={saveEdit}>Save</button>
                <button className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <div className="list-item-title">Style# {style.styleNumber}</div>
                <div className="list-item-sub">Pattern: {style.pattern}</div>
                <div className="list-item-sub">Description: {style.description}</div>
              </div>
              <div>
                <button className="btn btn-secondary" onClick={() => startEdit(style)}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(style.id)}>Delete</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}