const https = require('https');
https.get('https://expert-platform-production-626e.up.railway.app/index.html', r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    const scripts = d.match(/<script>([\s\S]*?)<\/script>/g);
    const m = scripts[1].match(/<script>([\s\S]*?)<\/script>/);
    const code = m[1];
    
    // Check first 5 and last 5 char codes
    console.log('First 5:', [0,1,2,3,4].map(i => code.charCodeAt(i)));
    console.log('Last 5:', [code.length-5, code.length-4, code.length-3, code.length-2, code.length-1].map(i => code.charCodeAt(i)));
    
    // Extract all lines containing "tab" outside string literals
    const lines = code.split('\n');
    let inString = false;
    let stringChar = '';
    lines.forEach((line, i) => {
      for (let j = 0; j < line.length; j++) {
        const c = line[j];
        if (!inString && (c === '"' || c === "'" || c === '`')) {
          inString = true;
          stringChar = c;
        } else if (inString && c === stringChar && line[j-1] !== '\\') {
          inString = false;
        } else if (!inString && c === 't' && line[j+1] === 'a' && line[j+2] === 'b' && !/[a-zA-Z0-9_$]/.test(line[j+3]||'') && !/[a-zA-Z0-9_$]/.test(line[j-1]||'')) {
          console.log('Line', i+1, 'standalone tab at', j, ':', JSON.stringify(line.substring(Math.max(0,j-20),j+20)));
        }
      }
    });
    
    // Try eval instead of new Function to see if error changes
    try {
      eval(code);
    } catch(e) {
      console.log('eval error:', e.message);
    }
    
    process.exit(0);
  });
}).on('error', e => { console.log('Error:', e.message); process.exit(1); });