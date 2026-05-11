import React from 'react';

function showSnackbar(msg) {
  const el = document.getElementById('snackbar');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

const makeCell = () => ({ qty: '', bundleSize: '' });

export default function BundleGenerator({
  selectedStyle, setSelectedStyle,
  startingBundle, setStartingBundle,
  preview, setPreview,
}) {
  const [styles, setStyles]       = React.useState([]);
  const [sizes, setSizes]         = React.useState(['4', '6', '8', '10']);
  const [colorRows, setColorRows] = React.useState([
    { color: '', cells: { '4': makeCell(), '6': makeCell(), '8': makeCell(), '10': makeCell() } },
  ]);

  React.useEffect(() => { loadStyles(); }, []);

  // Auto preview whenever grid changes
  React.useEffect(() => {
    if (!startingBundle || isNaN(startingBundle)) { setPreview([]); return; }

    let bundleNum = parseInt(startingBundle);
    const bundles = [];

    for (const row of colorRows) {
      if (!row.color) continue;
      for (const size of sizes) {
        const cell  = row.cells[size];
        if (!cell) continue;
        const qty   = parseInt(cell.qty);
        const bSize = parseInt(cell.bundleSize);
        if (!qty || !bSize || isNaN(qty) || isNaN(bSize) || qty <= 0 || bSize <= 0) continue;

        const fullBundles = Math.floor(qty / bSize);
        const remainder   = qty % bSize;

        for (let i = 0; i < fullBundles; i++) {
          bundles.push({ bundleNumber: bundleNum.toString(), color: row.color, sizeText: size, quantity: bSize });
          bundleNum++;
        }
        if (remainder > 0) {
          bundles.push({ bundleNumber: bundleNum.toString(), color: row.color, sizeText: size, quantity: remainder });
          bundleNum++;
        }
      }
    }

    setPreview(bundles);
  }, [colorRows, sizes, startingBundle]);

  async function loadStyles() {
    const data = await window.api.getStyles();
    setStyles(data);
  }

  function addSize() {
    const newSize = '';
    setSizes(prev => [...prev, newSize]);
    setColorRows(prev => prev.map(row => ({
      ...row,
      cells: { ...row.cells, [newSize]: makeCell() },
    })));
  }

  function updateSize(index, value) {
    const oldSize = sizes[index];
    setSizes(prev => prev.map((s, i) => i === index ? value : s));
    setColorRows(prev => prev.map(row => {
      const cells = { ...row.cells };
      const old = cells[oldSize] ?? makeCell();
      delete cells[oldSize];
      cells[value] = old;
      return { ...row, cells };
    }));
  }

  function removeSize(index) {
    const sizeToRemove = sizes[index];
    setSizes(prev => prev.filter((_, i) => i !== index));
    setColorRows(prev => prev.map(row => {
      const cells = { ...row.cells };
      delete cells[sizeToRemove];
      return { ...row, cells };
    }));
  }

  function addColorRow() {
    const cells = {};
    sizes.forEach(s => { cells[s] = makeCell(); });
    setColorRows(prev => [...prev, { color: '', cells }]);
  }

  function removeColorRow(index) {
    setColorRows(prev => prev.filter((_, i) => i !== index));
  }

  function updateColor(index, value) {
    setColorRows(prev => prev.map((row, i) =>
      i === index ? { ...row, color: value } : row
    ));
  }

  function updateCell(rowIndex, size, field, value) {
    setColorRows(prev => prev.map((row, i) =>
      i === rowIndex
        ? { ...row, cells: { ...row.cells, [size]: { ...row.cells[size], [field]: value } } }
        : row
    ));
  }

  function updatePreviewRow(index, field, value) {
    setPreview(prev => prev.map((b, i) =>
      i === index ? { ...b, [field]: value } : b
    ));
  }

  function removePreviewRow(index) {
    setPreview(prev => prev.filter((_, i) => i !== index));
  }

  function addPreviewRow() {
    const last = preview[preview.length - 1];
    const nextNum = last ? (parseInt(last.bundleNumber) + 1).toString() : startingBundle || '1';
    setPreview(prev => [...prev, { bundleNumber: nextNum, color: '', sizeText: '', quantity: '' }]);
  }

  async function handleGenerate() {
    if (!selectedStyle) { showSnackbar('Please select a style'); return; }
    if (preview.length === 0) { showSnackbar('No bundles to generate — fill in the grid'); return; }

    for (const bundle of preview) {
      if (!bundle.bundleNumber || bundle.quantity === '' || isNaN(bundle.quantity)) {
        showSnackbar('All bundles must have a valid bundle number and quantity');
        return;
      }
    }

    const styleId = parseInt(selectedStyle);
    for (const bundle of preview) {
      const dupes = await window.api.checkDuplicateBundle(bundle.bundleNumber, styleId);
      if (dupes.length > 0) {
        showSnackbar(`Bundle# ${bundle.bundleNumber} already exists for this style`);
        return;
      }
    }

    for (const bundle of preview) {
      await window.api.insertBundle({
        styleId,
        bundleNumber: bundle.bundleNumber,
        color:        bundle.color,
        sizeText:     bundle.sizeText,
        quantity:     parseInt(bundle.quantity),
      });
    }

    showSnackbar(`${preview.length} bundles created successfully!`);
    handleClear();
  }

  function handleClear() {
    setSelectedStyle('');
    setStartingBundle('');
    setSizes(['4', '6', '8', '10']);
    setColorRows([{ color: '', cells: { '4': makeCell(), '6': makeCell(), '8': makeCell(), '10': makeCell() } }]);
    setPreview([]);
  }

  const totalPreviewQty = preview.reduce((sum, b) => sum + (parseInt(b.quantity) || 0), 0);

  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', overflowX: 'auto' }}>

      {/* Left — grid */}
      <div style={{ minWidth: 500 }}>
        <h2 style={{ marginBottom: 20 }}>Bundle Generator</h2>

        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label>Style</label>
            <select value={selectedStyle} onChange={e => setSelectedStyle(e.target.value)}>
              <option value="">-- Select Style --</option>
              {styles.map(s => (
                <option key={s.id} value={s.id}>Style# {s.styleNumber}</option>
              ))}
            </select>
          </div>
          <div style={{ width: 140 }}>
            <label>Starting Bundle#</label>
            <input
              type="number"
              value={startingBundle}
              onChange={e => setStartingBundle(e.target.value)}
              placeholder="e.g. 501"
            />
          </div>
        </div>

        <p style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
          Each cell: top = Quantity, bottom = Qty Per Bundle
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#2c2c2c', color: 'white' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', minWidth: 90 }}>Color</th>
                {sizes.map((size, si) => (
                  <th key={si} style={{ padding: '6px 8px', textAlign: 'center', minWidth: 110 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                      <input
                        type="text"
                        value={size}
                        onChange={e => updateSize(si, e.target.value)}
                        style={{ width: 45, padding: '2px 4px', margin: 0, fontSize: 12, textAlign: 'center', background: '#444', color: 'white', border: '1px solid #666', borderRadius: 4 }}
                      />
                      {sizes.length > 1 && (
                        <button
                          onClick={() => removeSize(si)}
                          style={{ background: '#e53e3e', color: 'white', border: 'none', borderRadius: 3, padding: '1px 5px', cursor: 'pointer', fontSize: 10 }}
                        >✕</button>
                      )}
                    </div>
                  </th>
                ))}
                <th style={{ padding: '6px 8px' }}>
                  <button
                    onClick={addSize}
                    style={{ background: '#555', color: 'white', border: 'none', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontSize: 12 }}
                  >+ Size</button>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {colorRows.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? 'white' : '#f9f9f9', borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '6px 8px' }}>
                    <input
                      type="text"
                      value={row.color}
                      onChange={e => updateColor(ri, e.target.value)}
                      placeholder="Color"
                      style={{ width: 75, padding: '4px 6px', margin: 0, fontSize: 12 }}
                    />
                  </td>
                  {sizes.map((size, si) => (
                    <td key={si} style={{ padding: '5px 8px', textAlign: 'center' }}>
                      <input
                        type="number"
                        value={row.cells[size]?.qty ?? ''}
                        onChange={e => updateCell(ri, size, 'qty', e.target.value)}
                        placeholder="Qty"
                        style={{ width: 55, padding: '3px 4px', margin: '0 0 3px 0', fontSize: 12, display: 'block' }}
                      />
                      <input
                        type="number"
                        value={row.cells[size]?.bundleSize ?? ''}
                        onChange={e => updateCell(ri, size, 'bundleSize', e.target.value)}
                        placeholder="/Bun"
                        style={{ width: 55, padding: '3px 4px', margin: 0, fontSize: 12, display: 'block', background: '#f0f0f0' }}
                      />
                    </td>
                  ))}
                  <td></td>
                  <td style={{ padding: '5px 6px' }}>
                    {colorRows.length > 1 && (
                      <button
                        className="btn btn-danger"
                        onClick={() => removeColorRow(ri)}
                        style={{ padding: '3px 8px', fontSize: 11 }}
                      >✕</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 10 }}>
          <button className="btn btn-secondary" onClick={addColorRow} style={{ fontSize: 13 }}>
            + Add Color
          </button>
        </div>

        <div style={{ marginTop: 16 }}>
          <button className="btn btn-primary" onClick={handleGenerate} disabled={preview.length === 0}>
            Generate Bundles
          </button>
          <button className="btn btn-secondary" onClick={handleClear}>Clear</button>
        </div>
      </div>

      {/* Right — live preview */}
      <div style={{ flex: 1, minWidth: 340 }}>
        <h3 style={{ marginBottom: 12 }}>
          {preview.length > 0
            ? `Preview — ${preview.length} bundle${preview.length > 1 ? 's' : ''}, ${totalPreviewQty} total pieces`
            : 'Preview'}
        </h3>
        {preview.length === 0 ? (
          <p style={{ color: '#888', fontSize: 14 }}>
            Fill in the grid to see a live preview.
          </p>
        ) : (
          <>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
              You can edit any values before generating.
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#2c2c2c', color: 'white' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Bundle#</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Color</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Size</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Quantity</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {preview.map((b, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#f9f9f9', borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '5px 6px' }}>
                      <input type="number" value={b.bundleNumber}
                        onChange={e => updatePreviewRow(i, 'bundleNumber', e.target.value)}
                        style={{ width: 75, padding: '4px 6px', margin: 0 }} />
                    </td>
                    <td style={{ padding: '5px 6px' }}>
                      <input type="text" value={b.color}
                        onChange={e => updatePreviewRow(i, 'color', e.target.value)}
                        style={{ width: 75, padding: '4px 6px', margin: 0 }} />
                    </td>
                    <td style={{ padding: '5px 6px' }}>
                      <input type="text" value={b.sizeText}
                        onChange={e => updatePreviewRow(i, 'sizeText', e.target.value)}
                        style={{ width: 55, padding: '4px 6px', margin: 0 }} />
                    </td>
                    <td style={{ padding: '5px 6px' }}>
                      <input type="number" value={b.quantity}
                        onChange={e => updatePreviewRow(i, 'quantity', e.target.value)}
                        style={{ width: 75, padding: '4px 6px', margin: 0 }} />
                    </td>
                    <td style={{ padding: '5px 6px' }}>
                      <button className="btn btn-danger" onClick={() => removePreviewRow(i)}
                        style={{ padding: '4px 10px', fontSize: 12 }}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-secondary" onClick={addPreviewRow} style={{ marginTop: 10 }}>
              + Add Row
            </button>
          </>
        )}
      </div>
    </div>
  );
}