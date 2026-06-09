import React, { useState, useEffect } from 'react';
import StyleEntry from './components/StyleEntry';
import StyleView from './components/StyleView';
import BundleView from './components/BundleView';
import PrintPreview from './components/PrintPreview';
import BundleGenerator from './components/BundleGenerator';
import Report from './components/Report';

const TABS = [
  { id: 'styleEntry',  label: 'Style Entry' },
  { id: 'styleView',   label: 'Style View' },
  { id: 'generator',   label: 'Bundle Generator' },
  { id: 'bundleView',  label: 'Bundle View' },
  { id: 'report',      label: 'Traffic Sheet' },
  { id: 'print',       label: 'Print Preview' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('styleEntry');

  const [updateStatus, setUpdateStatus] = useState(null);
  // StyleEntry state
  const [seStyleNumber, setSeStyleNumber]     = useState('');
  const [sePattern, setSePattern]             = useState('');
  const [seDescription, setSeDescription]     = useState('');

  // BundleEntry state
  const [beSelectedStyle, setBeSelectedStyle] = useState('');
  const [beBundleNumber, setBeBundleNumber]   = useState('');
  const [beColor, setBeColor]                 = useState('');
  const [beSizeText, setBeSizeText]           = useState('');
  const [beQuantity, setBeQuantity]           = useState('');

  // BundleGenerator state
  const [bgSelectedStyle, setBgSelectedStyle] = useState('');
  // const [bgColor, setBgColor]                 = useState('');
  // const [bgSizeText, setBgSizeText]           = useState('');
  // const [bgTotalQuantity, setBgTotalQuantity] = useState('');
  // const [bgBundleSize, setBgBundleSize]       = useState('');
  const [bgStartingBundle, setBgStartingBundle] = useState('');
  const [bgPreview, setBgPreview]             = useState([]);

  useEffect(() => {
  if (window.api.onUpdateAvailable) {
    window.api.onUpdateAvailable(() => {
      setUpdateStatus('available');
    });
  }
  if (window.api.onUpdateDownloaded) {
    window.api.onUpdateDownloaded(() => {
      setUpdateStatus('downloaded');
    });
  }
}, []);

  function renderTab() {
    switch (activeTab) {
      case 'styleEntry':
        return (
          <StyleEntry
            styleNumber={seStyleNumber} setStyleNumber={setSeStyleNumber}
            pattern={sePattern}         setPattern={setSePattern}
            description={seDescription} setDescription={setSeDescription}
          />
        );
      case 'styleView':
        return <StyleView />;
      case 'generator':
        return (
          <BundleGenerator
            selectedStyle={bgSelectedStyle} setSelectedStyle={setBgSelectedStyle}
            // color={bgColor}                 setColor={setBgColor}
            // sizeText={bgSizeText}           setSizeText={setBgSizeText}
            // totalQuantity={bgTotalQuantity} setTotalQuantity={setBgTotalQuantity}
            // bundleSize={bgBundleSize}       setBundleSize={setBgBundleSize}
            startingBundle={bgStartingBundle} setStartingBundle={setBgStartingBundle}
            preview={bgPreview}             setPreview={setBgPreview}
          />
        );
      case 'bundleView':
        return <BundleView />;
     
      case 'report':
        return <Report />;
      case 'print':
        return <PrintPreview />;
      default:
        return null;
    }
  }

  return (
  <div>
    {updateStatus === 'available' && (
      <div style={{ background: '#2c7be5', color: 'white', padding: '8px 16px', fontSize: 13 }}>
        A new update is downloading in the background...
      </div>
    )}
    {updateStatus === 'downloaded' && (
      <div style={{ background: '#38a169', color: 'white', padding: '8px 16px', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>A new version is ready to install!</span>
        <button
          onClick={() => window.api.installUpdate()}
          style={{ background: 'white', color: '#38a169', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer', fontWeight: 600 }}
        >
          Restart & Update
        </button>
      </div>
    )}
    <div className="tab-bar">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={activeTab === tab.id ? 'active' : ''}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
    <div className="tab-content">
      {renderTab()}
    </div>
  </div>
);
}