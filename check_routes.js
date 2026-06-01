const fs = require('fs');
const app = fs.readFileSync('C:\\Users\\dailu\\Desktop\\expert-platform\\app.js', 'utf8');
console.log('app.js size:', app.length);
const routes = app.match(/app\.(get|post|put|delete)\(['"]/g);
console.log('Routes count:', routes ? routes.length : 0);

// Find schedule, coupon, booking related routes
const lines = app.split('\n');
for (let i = 0; i < lines.length; i++) {
  const l = lines[i].toLowerCase();
  if (l.includes('schedule') || l.includes('coupon') || l.includes('booking') || l.includes('faq')) {
    console.log(`L${i+1}:`, lines[i].trim().substring(0, 120));
  }
}

// Check for p0_routes
try {
  const p0 = fs.readFileSync('C:\\Users\\dailu\\Desktop\\expert-platform\\p0_routes.js', 'utf8');
  console.log('\np0_routes.js size:', p0.length);
  const p0routes = p0.match(/router\.(get|post|put|delete)\(['"]/g);
  console.log('P0 routes count:', p0routes ? p0routes.length : 0);
  for (let i = 0; i < p0.split('\n').length; i++) {
    const line = p0.split('\n')[i].toLowerCase();
    if (line.includes('schedule') || line.includes('coupon') || line.includes('booking')) {
      console.log(`P0 L${i+1}:`, p0.split('\n')[i].trim().substring(0, 120));
    }
  }
} catch(e) { console.log('No p0_routes.js'); }
