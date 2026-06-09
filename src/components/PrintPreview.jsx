import React, { useState, useEffect } from 'react';

export default function PrintPreview() {
  const [styles, setStyles]           = useState([]);
  const [bundles, setBundles]         = useState([]);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedBundle, setSelectedBundle] = useState('');
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
    setSelectedBundle('');
    if (!styleId) {
      setBundles([]);
      setFilteredData([]);
      return;
    }
    const data = await window.api.getBundlesByStyle(parseInt(styleId));
    setBundles(data);
    generateLabels(data, '', styleId);
  }

  function handleBundleChange(bundleId) {
    setSelectedBundle(bundleId);
    generateLabels(bundles, bundleId, selectedStyle);
  }

  function generateLabels(bundleList, bundleId, styleId) {
    const style = styles.find(s => s.id === parseInt(styleId));
    if (!style) { setFilteredData([]); return; }

    const toShow = bundleId
      ? bundleList.filter(b => b.id === parseInt(bundleId))
      : bundleList;

    const patterns = style.pattern.split(', ');

    const labels = toShow.flatMap(bundle =>
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

  function handlePrint() {
    const printWindow = window.open('', '_blank');
    const labelWidth  = 100 / labelsPerRow;
    const labelHeight = 100 / rowsPerPage;

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

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label>Style</label>
          <select value={selectedStyle} onChange={e => handleStyleChange(e.target.value)}>
            <option value="">-- Select Style --</option>
            {styles.map(s => (
              <option key={s.id} value={s.id}>Style# {s.styleNumber}</option>
            ))}
          </select>
        </div>

        {bundles.length > 0 && (
          <div style={{ flex: 1, minWidth: 200 }}>
            <label>Bundle (optional)</label>
            <select value={selectedBundle} onChange={e => handleBundleChange(e.target.value)}>
              <option value="">-- All Bundles --</option>
              {bundles.map(b => (
                <option key={b.id} value={b.id}>Bundle# {b.bundleNumber}</option>
              ))}
            </select>
          </div>
        )}
      </div>

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

      <button
        className="btn btn-primary"
        onClick={handlePrint}
        disabled={filteredData.length === 0}
        style={{ marginBottom: 20 }}
      >
        Print Labels
      </button>

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
            <div>Part: {item.pattern}</div>
            </div>
          ))}
        </div>
      )}

      {filteredData.length === 0 && selectedStyle && (
        <p style={{ color: '#888' }}>No bundles found for this style.</p>
      )}
    </div>
  );
}