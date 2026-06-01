const https = require('https');
https.get('https://expert-platform-production-626e.up.railway.app/index.html', r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    // Check for revenue tab
    const revenueIdx = d.indexOf("adminTab('revenue')");
    console.log('Revenue tab at:', revenueIdx);
    if (revenueIdx > -1) {
      console.log('Context:', d.substring(revenueIdx - 30, revenueIdx + 50));
    }
    
    // Check for class="tab" (unescaped)
    const bad = d.indexOf('class="tab"');
    console.log('Unescaped class="tab" at:', bad);
    
    // Check syntax
    const scripts = d.match(/<script>([\s\S]*?)<\/script>/g);
    if (scripts && scripts[1]) {
      const m = scripts[1].match(/<script>([\s\S]*?)<\/script>/);
      if (m) {
        try {
          new Function(m[1]);
          console.log('Railway syntax: OK');
        } catch(e) {
          console.log('Railway syntax ERROR:', e.message);
        }
      }
    }
    process.exit(0);
  });
}).on('error', e => { console.log('Error:', e.message); process.exit(1); });