import React, { useState, useEffect } from 'react';

export default function Report() {
  const [styles, setStyles]         = useState([]);
  const [bundles, setBundles]       = useState([]);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [styleData, setStyleData]   = useState(null);
  const [filteredBundles, setFilteredBundles] = useState([]);
  const [checked, setChecked]       = useState({});
  const [date, setDate]             = useState(new Date().toLocaleDateString());

  useEffect(() => { loadStyles(); }, []);

  async function loadStyles() {
    const data = await window.api.getStyles();
    setStyles(data);
  }

  async function handleStyleChange(styleId) {
    setSelectedStyle(styleId);
    setChecked({});
    if (!styleId) {
      setStyleData(null);
      setFilteredBundles([]);
      return;
    }
    const style = styles.find(s => s.id === parseInt(styleId));
    setStyleData(style);
    const data = await window.api.getBundlesByStyle(parseInt(styleId));
    setFilteredBundles(data);
  }

  function toggleCheck(bundleId, pattern) {
    const key = `${bundleId}-${pattern}`;
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function isChecked(bundleId, pattern) {
    return !!checked[`${bundleId}-${pattern}`];
  }

  // Build size summary
  function getSizeSummary() {
    const map = {};
    for (const b of filteredBundles) {
      if (!map[b.sizeText]) map[b.sizeText] = 0;
      map[b.sizeText] += b.quantity;
    }
    return map;
  }

  const patterns = styleData
    ? styleData.pattern.split(', ').filter(p => p.length > 0)
    : [];

  const sizeSummary = getSizeSummary();
  const grandTotal  = filteredBundles.reduce((sum, b) => sum + b.quantity, 0);

  function handlePrint() {
    const printWindow = window.open('', '_blank');

    const sizeHeaders = Object.keys(sizeSummary).map(s =>
      `<th style="border:1px solid #000;padding:4px 8px;">${s}</th>`
    ).join('');

    const sizeValues = Object.values(sizeSummary).map(v =>
      `<td style="border:1px solid #000;padding:4px 8px;text-align:center;">${v}</td>`
    ).join('');

    const patternHeaders = patterns.map(p =>
      `<th style="border:1px solid #000;padding:4px 6px;font-size:11px;">${p}</th>`
    ).join('');

    const bundleRows = filteredBundles.map(bundle => {
      const patternCells = patterns.map(p => {
        const tick = isChecked(bundle.id, p) ? '✓' : '';
        return `<td style="border:1px solid #000;padding:4px 6px;text-align:center;">${tick}</td>`;
      }).join('');
      return `
        <tr>
          <td style="border:1px solid #000;padding:4px 8px;">${bundle.bundleNumber}</td>
          <td style="border:1px solid #000;padding:4px 8px;">${bundle.color}</td>
          <td style="border:1px solid #000;padding:4px 8px;text-align:center;">${bundle.sizeText}</td>
          <td style="border:1px solid #000;padding:4px 8px;text-align:center;">${bundle.quantity}</td>
          ${patternCells}
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Traffic Sheet</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; font-size: 12px; }
            h2 { margin-bottom: 8px; }
            table { border-collapse: collapse; width: 100%; }
            th { background: #f0f0f0; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <h2>Traffic Sheet Control</h2>
          <table style="margin-bottom:12px;border:none;">
            <tr>
              <td style="padding:2px 8px 2px 0;border:none;"><strong>Date:</strong> ${date}</td>
              <td style="padding:2px 8px;border:none;"><strong>Style#:</strong> ${styleData?.styleNumber ?? ''}</td>
              <td style="padding:2px 8px;border:none;"><strong>Description:</strong> ${styleData?.description ?? ''}</td>
            </tr>
          </table>

          <!-- Size summary -->
          <table style="margin-bottom:16px;">
            <thead>
              <tr>
                ${sizeHeaders}
                <th style="border:1px solid #000;padding:4px 8px;">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                ${sizeValues}
                <td style="border:1px solid #000;padding:4px 8px;text-align:center;font-weight:bold;">${grandTotal}</td>
              </tr>
            </tbody>
          </table>

          <!-- Bundle table -->
          <table>
            <thead>
              <tr>
                <th style="border:1px solid #000;padding:4px 8px;">Bun#</th>
                <th style="border:1px solid #000;padding:4px 8px;">Colour</th>
                <th style="border:1px solid #000;padding:4px 8px;">Size</th>
                <th style="border:1px solid #000;padding:4px 8px;">Qty</th>
                ${patternHeaders}
              </tr>
            </thead>
            <tbody>
              ${bundleRows}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Traffic Sheet</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div>
            <label>Date</label>
            <input
              type="text"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ width: 140 }}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handlePrint}
            disabled={!selectedStyle || filteredBundles.length === 0}
            style={{ marginTop: 18 }}
          >
            Print Report
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <label>Style</label>
          <select value={selectedStyle} onChange={e => handleStyleChange(e.target.value)}>
            <option value="">-- Select Style --</option>
            {styles.map(s => (
              <option key={s.id} value={s.id}>Style# {s.styleNumber}</option>
            ))}
          </select>
        </div>
      </div>

      {styleData && (
        <div style={{ marginBottom: 16, fontSize: 13, color: '#555' }}>
          <strong>Description:</strong> {styleData.description || '—'}
        </div>
      )}

      {/* Size summary */}
      {filteredBundles.length > 0 && (
        <table style={{ borderCollapse: 'collapse', marginBottom: 20, fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#2c2c2c', color: 'white' }}>
              {Object.keys(sizeSummary).map(s => (
                <th key={s} style={{ padding: '6px 16px', border: '1px solid #444' }}>{s}</th>
              ))}
              <th style={{ padding: '6px 16px', border: '1px solid #444' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {Object.values(sizeSummary).map((v, i) => (
                <td key={i} style={{ padding: '6px 16px', border: '1px solid #ccc', textAlign: 'center' }}>{v}</td>
              ))}
              <td style={{ padding: '6px 16px', border: '1px solid #ccc', textAlign: 'center', fontWeight: 'bold' }}>{grandTotal}</td>
            </tr>
          </tbody>
        </table>
      )}

      {/* Bundle table */}
      {filteredBundles.length === 0 && selectedStyle && (
        <p style={{ color: '#888' }}>No bundles found for this style.</p>
      )}

      {filteredBundles.length === 0 && !selectedStyle && (
        <p style={{ color: '#888' }}>Select a style to view the traffic sheet.</p>
      )}

      {filteredBundles.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%' }}>
            <thead>
              <tr style={{ background: '#2c2c2c', color: 'white' }}>
                <th style={{ padding: '8px 12px', border: '1px solid #444', textAlign: 'left' }}>Bun#</th>
                <th style={{ padding: '8px 12px', border: '1px solid #444', textAlign: 'left' }}>Colour</th>
                <th style={{ padding: '8px 12px', border: '1px solid #444', textAlign: 'left' }}>Size</th>
                <th style={{ padding: '8px 12px', border: '1px solid #444', textAlign: 'left' }}>Qty</th>
                {patterns.map(p => (
                  <th key={p} style={{ padding: '8px 8px', border: '1px solid #444', textAlign: 'center', fontSize: 12 }}>{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredBundles.map((bundle, i) => (
                <tr key={bundle.id} style={{ background: i % 2 === 0 ? 'white' : '#f9f9f9' }}>
                  <td style={{ padding: '6px 12px', border: '1px solid #ddd' }}>{bundle.bundleNumber}</td>
                  <td style={{ padding: '6px 12px', border: '1px solid #ddd' }}>{bundle.color}</td>
                  <td style={{ padding: '6px 12px', border: '1px solid #ddd', textAlign: 'center' }}>{bundle.sizeText}</td>
                  <td style={{ padding: '6px 12px', border: '1px solid #ddd', textAlign: 'center' }}>{bundle.quantity}</td>
                  {patterns.map(p => (
                    <td key={p} style={{ padding: '6px 8px', border: '1px solid #ddd', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isChecked(bundle.id, p)}
                        onChange={() => toggleCheck(bundle.id, p)}
                        style={{ width: 16, height: 16, cursor: 'pointer' }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}