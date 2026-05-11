import React, { useState } from 'react';

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

export default function StyleEntry({
  styleNumber, setStyleNumber,
  pattern, setPattern,
  description, setDescription,
}) {
  async function handleSubmit() {
    if (!styleNumber) {
      showSnackbar('Style# must be entered');
      return;
    }
    if (!/^[0-9]+$/.test(styleNumber)) {
      showSnackbar('Style# must be numeric');
      return;
    }

    const normalized = normalizePattern(pattern);

    await window.api.insertStyle({
      styleNumber: styleNumber.trim(),
      pattern: normalized,
      description: description.trim(),
    });

    showSnackbar('Style submitted successfully');
    handleClear();
  }

  function handleClear() {
    setStyleNumber('');
    setPattern('');
    setDescription('');
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 style={{ marginBottom: 20 }}>Style Entry</h2>

      <label>Style#</label>
      <input
        type="number"
        value={styleNumber}
        onChange={e => setStyleNumber(e.target.value)}
        placeholder="e.g. 1001"
      />

      <label>Pattern</label>
      <input
        type="text"
        value={pattern}
        onChange={e => setPattern(e.target.value)}
        placeholder="e.g. Collar, Back, Sleeve"
      />
      <p style={{ fontSize: 12, color: '#888', marginTop: -10, marginBottom: 14 }}>
        Separate each entry with a space or comma
      </p>

      <label>Description</label>
      <input
        type="text"
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Optional description"
      />

      <div style={{ marginTop: 8 }}>
        <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
        <button className="btn btn-secondary" onClick={handleClear}>Clear</button>
      </div>
    </div>
  );
}