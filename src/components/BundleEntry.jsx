import React, { useEffect } from 'react';

function showSnackbar(msg) {
  const el = document.getElementById('snackbar');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

export default function BundleEntry({
  selectedStyle, setSelectedStyle,
  bundleNumber, setBundleNumber,
  color, setColor,
  sizeText, setSizeText,
  quantity, setQuantity,
}) {
  const [styles, setStyles] = React.useState([]);

  useEffect(() => { loadStyles(); }, []);

  async function loadStyles() {
    const data = await window.api.getStyles();
    setStyles(data);
  }

  async function handleSubmit() {
    if (!selectedStyle) {
      showSnackbar('Please select a style');
      return;
    }
    if (!/^[0-9]+$/.test(bundleNumber)) {
      showSnackbar('Bundle# must be numeric');
      return;
    }
    if (!quantity || isNaN(quantity)) {
      showSnackbar('Quantity must be a number');
      return;
    }

    const dupes = await window.api.checkDuplicateBundle(bundleNumber, parseInt(selectedStyle));
    if (dupes.length > 0) {
      showSnackbar('Bundle# already exists for the selected style');
      return;
    }

    await window.api.insertBundle({
      styleId:      parseInt(selectedStyle),
      bundleNumber: bundleNumber.trim(),
      color:        color.trim(),
      sizeText:     sizeText.trim(),
      quantity:     parseInt(quantity),
    });

    showSnackbar('Bundle submitted successfully');
    handleClear();
  }

  function handleClear() {
    setSelectedStyle('');
    setBundleNumber('');
    setColor('');
    setSizeText('');
    setQuantity('');
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 style={{ marginBottom: 20 }}>Bundle Entry</h2>

      <label>Style</label>
      <select value={selectedStyle} onChange={e => setSelectedStyle(e.target.value)}>
        <option value="">-- Select Style --</option>
        {styles.map(s => (
          <option key={s.id} value={s.id}>Style# {s.styleNumber}</option>
        ))}
      </select>

      <label>Bundle#</label>
      <input
        type="number"
        value={bundleNumber}
        onChange={e => setBundleNumber(e.target.value)}
        placeholder="e.g. 501"
      />

      <label>Color</label>
      <input
        type="text"
        value={color}
        onChange={e => setColor(e.target.value)}
        placeholder="e.g. Red"
      />

      <label>Size</label>
      <input
        type="text"
        value={sizeText}
        onChange={e => setSizeText(e.target.value)}
        placeholder="e.g. M"
      />

      <label>Quantity</label>
      <input
        type="number"
        value={quantity}
        onChange={e => setQuantity(e.target.value)}
        placeholder="e.g. 12"
      />

      <div style={{ marginTop: 8 }}>
        <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
        <button className="btn btn-secondary" onClick={handleClear}>Clear</button>
      </div>
    </div>
  );
}