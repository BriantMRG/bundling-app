const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

const dbPath = path.join(app.getPath('userData'), 'bundling.db');
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS styles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    styleNumber TEXT NOT NULL,
    pattern TEXT,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS bundles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    styleId INTEGER NOT NULL,
    bundleNumber TEXT NOT NULL,
    color TEXT,
    sizeText TEXT,
    quantity INTEGER,
    FOREIGN KEY (styleId) REFERENCES styles(id)
  );
`);

// ── Styles ───────────────────────────────────────────
function getAllStyles() {
  return db.prepare('SELECT * FROM styles').all();
}

function insertStyle({ styleNumber, pattern, description }) {
  return db.prepare(
    'INSERT INTO styles (styleNumber, pattern, description) VALUES (?, ?, ?)'
  ).run(styleNumber, pattern, description);
}

function updateStyle({ id, styleNumber, pattern, description }) {
  return db.prepare(
    'UPDATE styles SET styleNumber=?, pattern=?, description=? WHERE id=?'
  ).run(styleNumber, pattern, description, id);
}

function deleteStyle(id) {
  return db.prepare('DELETE FROM styles WHERE id=?').run(id);
}

// ── Bundles ──────────────────────────────────────────
function getAllBundles() {
  return db.prepare('SELECT * FROM bundles').all();
}

function getBundlesByStyle(styleId) {
  return db.prepare('SELECT * FROM bundles WHERE styleId=?').all(styleId);
}

function insertBundle({ styleId, bundleNumber, color, sizeText, quantity }) {
  return db.prepare(
    'INSERT INTO bundles (styleId, bundleNumber, color, sizeText, quantity) VALUES (?, ?, ?, ?, ?)'
  ).run(styleId, bundleNumber, color, sizeText, quantity);
}

function updateBundle({ id, styleId, bundleNumber, color, sizeText, quantity }) {
  return db.prepare(
    'UPDATE bundles SET styleId=?, bundleNumber=?, color=?, sizeText=?, quantity=? WHERE id=?'
  ).run(styleId, bundleNumber, color, sizeText, quantity, id);
}

function deleteBundle(id) {
  return db.prepare('DELETE FROM bundles WHERE id=?').run(id);
}

function checkDuplicateBundle(bundleNumber, styleId) {
  return db.prepare(
    'SELECT * FROM bundles WHERE bundleNumber=? AND styleId=?'
  ).all(bundleNumber, styleId);
}

module.exports = {
  getAllStyles,
  insertStyle,
  updateStyle,
  deleteStyle,
  getAllBundles,
  getBundlesByStyle,
  insertBundle,
  updateBundle,
  deleteBundle,
  checkDuplicateBundle,
};