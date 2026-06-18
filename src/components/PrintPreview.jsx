import React, { useState, useEffect } from 'react';

export default function PrintPreview() {
  const [styles, setStyles]           = useState([]);
  const [bundles, setBundles]         = useState([]);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedBundles, setSelectedBundles] = useState([]);
  const [filteredData, setFilteredData]   = useState([]);
  const [labelsPerRow, setLabelsPerRow]   = useState(3);
  const [rowsPerPage, setRowsPerPage]     = useState(3);
  const [fontSize, setFontSize]           = useState(14);

  useEffect(() => { loadStyles(); }, []);

  async function loadStyles() {
    const data = await window.api.getStyles();
    setStyles(data);
  }

  async function handleStyleChange(styleId) {
    setSelectedStyle(styleId);
    setSelectedBundles([]);
    setFilteredData([]);
    if (!styleId) {
      setBundles([]);
      return;
    }
    const data = await window.api.getBundlesByStyle(parseInt(styleId));
    setBundles(data);
  }

  function toggleBundle(bundleId) {
    setSelectedBundles(prev =>
      prev.includes(bundleId)
        ? prev.filter(id => id !== bundleId)
        : [...prev, bundleId]
    );
  }

  function selectAll() {
    setSelectedBundles(bundles.map(b => b.id));
  }

  function deselectAll() {
    setSelectedBundles([]);
  }

  function generateLabels(bundleList, styleId) {
    const style = styles.find(s => s.id === parseInt(styleId));
    if (!style) { setFilteredData([]); return; }

    const patterns = style.pattern.split(', ');

    const labels = bundleList.flatMap(bundle =>
      patterns.map(pattern => ({
        pattern,
        color:        bundle.color,
        size:         bundle.sizeText,
        quantity:     bundle.quantity,
        bundleNumber: bundle.bundleNumber,
        styleNumber:  style.styleNumber,
        description:  style.description,
      }))
    );

    setFilteredData(labels);
  }

  function handlePreview() {
    if (selectedBundles.length === 0) {
      const el = document.getElementById('snackbar');
      el.textContent = 'Please select at least one bundle';
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 3000);
      return;
    }
    const toShow = bundles.filter(b => selectedBundles.includes(b.id));
    generateLabels(toShow, selectedStyle);
  }

  function handlePrint() {
    const printWindow = window.open('', '_blank');

    const labelsHtml = filteredData.map(item => `
      <div style="
        width: calc(${100 / labelsPerRow}% - 4px);
        min-height: 80px;
        box-sizing: border-box;
        border: 1px solid #000;
        padding: 6px 8px;
        display: inline-block;
        vertical-align: top;
        font-size: ${fontSize}px;
        font-family: Helvetica, sans-serif;
        overflow: hidden;
      ">
        <div style="font-size:${fontSize + 4}px;font-weight:bold;">Style#: ${item.styleNumber} &nbsp;&nbsp; ${item.description ? item.description : ''}</div>
        <div>Bundle#: ${item.bundleNumber}</div>
        <div>Color: ${item.color}</div>
        <div>Size: ${item.size}</div>
        <div>Qty: ${item.quantity}</div>
        <div>Part: ${item.pattern}</div>
      </div>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Labels</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { margin: 0; padding: 0; font-size: 0; }
            @page { margin: 0.5cm; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${labelsHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  const rowOptions   = [1, 2, 3, 4, 5];
  const sizeOptions  = Array.from({ length: 21 }, (_, i) => i + 10);

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Print Preview</h2>

      {/* Style selector */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label>Style</label>
          <select value={selectedStyle} onChange={e => handleStyleChange(e.target.value)}>
            <option value="">-- Select Style --</option>
            {styles.map(s => (
              <option key={s.id} value={s.id}>Style# {s.styleNumber} {s.description ? `— ${s.description}` : ''}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bundle selection */}
      {bundles.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <label style={{ fontWeight: 600 }}>Select Bundles</label>
            <button className="btn btn-secondary" onClick={selectAll} style={{ padding: '4px 10px', fontSize: 12 }}>Select All</button>
            <button className="btn btn-secondary" onClick={deselectAll} style={{ padding: '4px 10px', fontSize: 12 }}>Deselect All</button>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 8,
            maxHeight: 200,
            overflowY: 'auto',
            border: '1px solid #eee',
            borderRadius: 6,
            padding: 10,
            background: 'white',
          }}>
            {bundles.map(b => (
              <label key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedBundles.includes(b.id)}
                  onChange={() => toggleBundle(b.id)}
                  style={{ width: 16, height: 16, margin: 0 }}
                />
                Bundle# {b.bundleNumber} ({b.color}, {b.sizeText})
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Print settings */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <label>Labels Per Row</label>
          <select value={labelsPerRow} onChange={e => setLabelsPerRow(parseInt(e.target.value))}>
            {rowOptions.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label>Rows Per Page</label>
          <select value={rowsPerPage} onChange={e => setRowsPerPage(parseInt(e.target.value))}>
            {rowOptions.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label>Font Size</label>
          <select value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))}>
            {sizeOptions.map(n => <option key={n} value={n}>{n}px</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
        <button
          className="btn btn-secondary"
          onClick={handlePreview}
          disabled={selectedBundles.length === 0}
        >
          Preview
        </button>
        <button
          className="btn btn-primary"
          onClick={handlePrint}
          disabled={filteredData.length === 0}
        >
          Print Labels
        </button>
      </div>

      {/* Preview Grid */}
      {filteredData.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${labelsPerRow}, 1fr)`,
          gap: 8,
        }}>
          {filteredData.map((item, index) => (
            <div key={index} style={{
              border: '1px solid #ccc',
              borderRadius: 6,
              padding: 10,
              fontSize: fontSize,
              background: 'white',
            }}>
              <div style={{ fontSize: fontSize + 4, fontWeight: 'bold' }}>Style#: {item.styleNumber} {item.description}</div>
              <div>Bundle#: {item.bundleNumber}</div>
              <div>Color: {item.color}</div>
              <div>Size: {item.size}</div>
              <div>Qty: {item.quantity}</div>
              <div>Part: {item.pattern}</div>
            </div>
          ))}
        </div>
      )}

      {filteredData.length === 0 && selectedStyle && selectedBundles.length > 0 && (
        <p style={{ color: '#888' }}>Click Preview to see labels.</p>
      )}

      {selectedStyle && bundles.length === 0 && (
        <p style={{ color: '#888' }}>No bundles found for this style.</p>
      )}
    </div>
  );
}