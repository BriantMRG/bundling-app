import React, { useState, useEffect } from 'react';

function showSnackbar(msg) {
  const el = document.getElementById('snackbar');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

export default function BundleView() {
  const [bundles, setBundles]     = useState([]);
  const [styles, setStyles]       = useState([]);
  const [editing, setEditing]     = useState(null);
  const [bundleNumber, setBundleNumber] = useState('');
  const [color, setColor]         = useState('');
  const [sizeText, setSizeText]   = useState('');
  const [quantity, setQuantity]   = useState('');

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const [b, s] = await Promise.all([
      window.api.getBundles(),
      window.api.getStyles(),
    ]);
    setBundles(b);
    setStyles(s);
  }

  function getStyleNumber(styleId) {
    const style = styles.find(s => s.id === styleId);
    return style ? style.styleNumber : '?';
  }

  function startEdit(bundle) {
    setEditing(bundle.id);
    setBundleNumber(bundle.bundleNumber);
    setColor(bundle.color);
    setSizeText(bundle.sizeText);
    setQuantity(bundle.quantity.toString());
  }

  function cancelEdit() {
    setEditing(null);
    setBundleNumber('');
    setColor('');
    setSizeText('');
    setQuantity('');
  }

  async function saveEdit(bundle) {
    if (!/^[0-9]+$/.test(bundleNumber)) {
      showSnackbar('Bundle# must be numeric');
      return;
    }
    if (!quantity || isNaN(quantity)) {
      showSnackbar('Quantity must be a number');
      return;
    }

    await window.api.updateBundle({
      id:           bundle.id,
      styleId:      bundle.styleId,
      bundleNumber: bundleNumber.trim(),
      color:        color.trim(),
      sizeText:     sizeText.trim(),
      quantity:     parseInt(quantity),
    });

    showSnackbar('Bundle updated successfully');
    cancelEdit();
    loadAll();
  }

  async function handleDelete(id) {
    await window.api.deleteBundle(id);
    showSnackbar('Bundle deleted');
    loadAll();
  }

  if (bundles.length === 0) {
    return <p style={{ color: '#888' }}>No bundles available.</p>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Bundle View</h2>

      {bundles.map(bundle => (
        <div className="list-item" key={bundle.id}>
          {editing === bundle.id ? (
            <div style={{ flex: 1 }}>
              <label>Bundle#</label>
              <input
                type="number"
                value={bundleNumber}
                onChange={e => setBundleNumber(e.target.value)}
              />
              <label>Color</label>
              <input
                type="text"
                value={color}
                onChange={e => setColor(e.target.value)}
              />
              <label>Size</label>
              <input
                type="text"
                value={sizeText}
                onChange={e => setSizeText(e.target.value)}
              />
              <label>Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
              />
              <div style={{ marginTop: 8 }}>
                <button className="btn btn-primary" onClick={() => saveEdit(bundle)}>Save</button>
                <button className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <div className="list-item-title">Bundle# {bundle.bundleNumber}</div>
                <div className="list-item-sub">Style#: {getStyleNumber(bundle.styleId)}</div>
                <div className="list-item-sub">Color: {bundle.color}</div>
                <div className="list-item-sub">Size: {bundle.sizeText}</div>
                <div className="list-item-sub">Quantity: {bundle.quantity}</div>
              </div>
              <div>
                <button className="btn btn-secondary" onClick={() => startEdit(bundle)}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(bundle.id)}>Delete</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}