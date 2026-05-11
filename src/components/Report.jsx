import React, { useState, useEffect } from 'react';

export default function Report() {
  const [styles, setStyles]   = useState([]);
  const [bundles, setBundles] = useState([]);
  const [summary, setSummary] = useState([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [s, b] = await Promise.all([
      window.api.getStyles(),
      window.api.getBundles(),
    ]);
    setStyles(s);
    setBundles(b);
    buildSummary(s, b);
  }

  function buildSummary(styleList, bundleList) {
    const map = {};

    for (const bundle of bundleList) {
      const style = styleList.find(s => s.id === bundle.styleId);
      const styleNumber = style ? style.styleNumber : '?';
      const key = `${styleNumber}||${bundle.color}||${bundle.sizeText}`;

      if (!map[key]) {
        map[key] = {
          styleNumber,
          color:      bundle.color,
          size:       bundle.sizeText,
          totalQty:   0,
          bundleCount: 0,
        };
      }
      map[key].totalQty   += bundle.quantity;
      map[key].bundleCount += 1;
    }

    setSummary(Object.values(map));
  }

  function handlePrint() {
    const printWindow = window.open('', '_blank');

    const rows = summary.map((row, i) => `
      <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#f9f9f9'}">
        <td>${row.styleNumber}</td>
        <td>${row.color}</td>
        <td>${row.size}</td>
        <td>${row.bundleCount}</td>
        <td>${row.totalQty}</td>
      </tr>
    `).join('');

    const grandTotal = summary.reduce((sum, r) => sum + r.totalQty, 0);
    const totalBundles = summary.reduce((sum, r) => sum + r.bundleCount, 0);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bundle Report</title>
          <style>
            body { font-family: Helvetica, sans-serif; padding: 24px; color: #333; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            p { font-size: 13px; color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 14px; }
            th { background: #2c2c2c; color: white; padding: 10px 12px; text-align: left; }
            td { padding: 8px 12px; border-bottom: 1px solid #eee; }
            tfoot td { font-weight: bold; background: #f0f0f0; padding: 10px 12px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <h1>Bundle Summary Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Style#</th>
                <th>Color</th>
                <th>Size</th>
                <th>No. of Bundles</th>
                <th>Total Quantity</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
              <tr>
                <td colspan="3">Grand Total</td>
                <td>${totalBundles}</td>
                <td>${grandTotal}</td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  const grandTotal   = summary.reduce((sum, r) => sum + r.totalQty, 0);
  const totalBundles = summary.reduce((sum, r) => sum + r.bundleCount, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Bundle Summary Report</h2>
        <button className="btn btn-primary" onClick={handlePrint} disabled={summary.length === 0}>
          Print Report
        </button>
      </div>

      {summary.length === 0 ? (
        <p style={{ color: '#888' }}>No bundle data available.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#2c2c2c', color: 'white' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Style#</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Color</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Size</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>No. of Bundles</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Total Quantity</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#f9f9f9', borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px 12px' }}>{row.styleNumber}</td>
                <td style={{ padding: '8px 12px' }}>{row.color}</td>
                <td style={{ padding: '8px 12px' }}>{row.size}</td>
                <td style={{ padding: '8px 12px' }}>{row.bundleCount}</td>
                <td style={{ padding: '8px 12px' }}>{row.totalQty}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: '#f0f0f0', fontWeight: 'bold' }}>
              <td style={{ padding: '10px 12px' }} colSpan={3}>Grand Total</td>
              <td style={{ padding: '10px 12px' }}>{totalBundles}</td>
              <td style={{ padding: '10px 12px' }}>{grandTotal}</td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}