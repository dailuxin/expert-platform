const fs = require('fs');
const p = String.raw`C:\Users\dailu\Desktop\expert-platform\app.js`;
let app = fs.readFileSync(p, 'utf8');

// Add coupon routes before the P0 section
const p0Marker = '// P0 features';
if (app.includes(p0Marker) && !app.includes('/coupons')) {
  const couponRoutes = `
// ===== Coupons =====
app.get('/api/coupons/mine', requireAuth, (req, res) => {
  const list = query('SELECT * FROM coupons WHERE user_id = ? ORDER BY created_at DESC', [req.session.userId]);
  res.json({ list });
});

app.post('/api/coupons/claim', requireAuth, (req, res) => {
  const existing = get('SELECT id FROM coupons WHERE user_id = ? AND status = ?', [req.session.userId, 'active']);
  if (existing) return res.json({ error: '您已领取过优惠券' });
  const count = get('SELECT COUNT(*) as c FROM coupons WHERE status = ?', ['active']);
  if (count && count.c >= 500) return res.json({ error: '优惠券已抢完' });
  run('INSERT INTO coupons (user_id, amount, min_amount, status) VALUES (?, 20, 0, ?)', [req.session.userId, 'active']);
  res.json({ success: true });
});

`;

  app = app.replace(p0Marker, couponRoutes + p0Marker);
  console.log('Coupon routes added');
}

// Add advanced search params to /api/experts
const expertsRoute = 'app.get(\'/api/experts\'';
if (expertsRoute && app.includes('/api/experts') && !app.includes('min_price')) {
  // Find the experts route handler
  const idx = app.indexOf("'/api/experts'");
  if (idx > 0) {
    // Find the line that reads keyword and industry
    const kwLine = app.indexOf('keyword', idx);
    if (kwLine > 0 && kwLine < idx + 500) {
      console.log('Experts route keyword at:', kwLine);
      // Add min_price, max_price, min_rating to the query
      // We need to add WHERE conditions
      const whereIdx = app.indexOf('WHERE', idx);
      if (whereIdx > 0 && whereIdx < idx + 800) {
        console.log('WHERE clause at:', whereIdx);
      }
    }
  }
  console.log('Advanced search in /api/experts needs manual review');
}

// Add coupon table to database.js
const dbP = String.raw`C:\Users\dailu\Desktop\expert-platform\database.js`;
let db = fs.readFileSync(dbP, 'utf8');

if (!db.includes('coupons')) {
  // Find where other CREATE TABLE statements are
  const lastTable = db.lastIndexOf('CREATE TABLE IF NOT EXISTS');
  if (lastTable > 0) {
    const afterLast = db.indexOf(');', lastTable) + 2;
    db = db.substring(0, afterLast) + `
run('CREATE TABLE IF NOT EXISTS coupons (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, amount INTEGER DEFAULT 20, min_amount INTEGER DEFAULT 0, status TEXT DEFAULT \\'active\\', created_at TEXT DEFAULT (datetime(\\'now\\')), used_at TEXT)');
` + db.substring(afterLast);
    console.log('Coupons table added to database.js');
  }
}

fs.writeFileSync(p, app, 'utf8');
fs.writeFileSync(dbP, db, 'utf8');
console.log('Saved app.js and database.js');
