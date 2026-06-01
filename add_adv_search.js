const fs = require('fs');
const p = String.raw`C:\Users\dailu\Desktop\expert-platform\app.js`;
let app = fs.readFileSync(p, 'utf8');

// Add advanced search params
const target = `const { industry, keyword, page = 1, limit = 12 } = req.query;`;
if (!app.includes(target)) { console.log('target not found'); process.exit(1); }

const replacement = `const { industry, keyword, page = 1, limit = 12, min_price, max_price, min_rating } = req.query;`;
app = app.replace(target, replacement);
console.log('1. Query params extended');

// Add filter conditions after keyword block
const afterKeyword = `params.push('%' + keyword + '%', '%' + keyword + '%');`;
if (!app.includes(afterKeyword)) { console.log('afterKeyword not found'); process.exit(1); }

// Find the exact occurrence near /api/experts (not other routes)
const expertsIdx = app.indexOf("'/api/experts'");
const kwIdx = app.indexOf(afterKeyword, expertsIdx);
if (kwIdx < 0 || kwIdx > expertsIdx + 2000) { console.log('keyword push not found near experts'); process.exit(1); }

const insertAfter = kwIdx + afterKeyword.length;
const advFilters = `
  if (min_price) { where += ' AND e.consult_fee >= ?'; params.push(Number(min_price)); }
  if (max_price) { where += ' AND e.consult_fee <= ?'; params.push(Number(max_price)); }
  if (min_rating) { where += ' AND e.avg_rating >= ?'; params.push(Number(min_rating)); }`;

app = app.substring(0, insertAfter) + advFilters + app.substring(insertAfter);
console.log('2. Advanced filter conditions added');

fs.writeFileSync(p, app, 'utf8');
console.log('Saved');
