const fs = require('fs');
const p = String.raw`C:\Users\dailu\Desktop\expert-platform\app.js`;
let app = fs.readFileSync(p, 'utf8');

// Find the experts route WHERE clause and extend it
// Current: WHERE e.audit_status='approved' AND (keyword LIKE OR industry=)
// Need to add: AND e.consult_fee >= min_price AND e.consult_fee <= max_price AND e.avg_rating >= min_rating

const target = "const industry = req.query.industry;";
if (!app.includes(target)) { console.log('Industry var not found'); process.exit(1); }

const idx = app.indexOf(target);
console.log('Found at:', idx);

// Find the WHERE clause in the query
const whereStart = app.indexOf("WHERE e.audit_status='approved'", idx);
if (whereStart < 0 || whereStart > idx + 1000) { console.log('WHERE not found near experts route'); process.exit(1); }

console.log('WHERE at:', whereStart);
console.log('Context:', JSON.stringify(app.substring(whereStart, whereStart + 200)));

// Find the end of the WHERE clause (the next ; or run() call)
const whereEnd = app.indexOf("ORDER BY", whereStart);
if (whereEnd < 0) { console.log('ORDER BY not found'); process.exit(1); }

console.log('ORDER BY at:', whereEnd);
const whereClause = app.substring(whereStart, whereEnd);
console.log('WHERE clause:', whereClause);

// Now add advanced filter conditions
const newWhere = whereClause
  .replace("ORDER BY", ` AND e.consult_fee >= ? AND e.consult_fee <= ? AND (e.avg_rating >= ? OR e.avg_rating IS NULL) ORDER BY`);

// Also need to add params to the query() call
// Find the query parameters
const queryLine = app.indexOf('query(`SELECT', idx);
if (queryLine > 0) {
  console.log('Query call near:', queryLine);
  console.log('Query context:', JSON.stringify(app.substring(queryLine, Math.min(queryLine + 300, app.length))));
}
