const fs = require('fs');
const p1 = String.raw`C:\Users\dailu\Desktop\expert-platform\app.js`;
const p2 = String.raw`C:\Users\dailu\Desktop\expert-platform\database.js`;

try {
  // Check app.js syntax
  const app = fs.readFileSync(p1, 'utf8');
  // Remove the require() calls that load local modules since they won't be found in isolation
  // Just check for obvious syntax errors
  const cleanedApp = app.replace(/require\(['"].*?['"]\)/g, '{}');
  new Function(cleanedApp);
  console.log('app.js: syntax OK');
} catch (e) {
  console.log('app.js:', e.message);
}

try {
  const db = fs.readFileSync(p2, 'utf8');
  console.log('database.js: loaded,', db.length, 'chars, has coupons:', db.includes('coupons'));
} catch (e) {
  console.log('database.js:', e.message);
}
