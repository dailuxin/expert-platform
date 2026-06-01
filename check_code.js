const https = require('https');
https.get('https://expert-platform-production-626e.up.railway.app/index.html', r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    const scripts = d.match(/<script>([\s\S]*?)<\/script>/g);
    const m = scripts[1].match(/<script>([\s\S]*?)<\/script>/);
    const code = m[1];
    console.log('First 30 chars:', JSON.stringify(code.substring(0, 30)));
    console.log('First char code:', code.charCodeAt(0));
    console.log('Last 30 chars:', JSON.stringify(code.substring(code.length - 30)));
    console.log('Total lines:', code.split('\n').length);
    
    // Check for the 'tab' token
    const firstSpace = code.indexOf(' ');
    const firstTab = code.indexOf('\t');
    const firstLine = code.split('\n')[0];
    console.log('First line:', JSON.stringify(firstLine));
    
    // Check if there's a BOM or invisible char
    for (let i = 0; i < 5; i++) {
      console.log('Char[' + i + ']:', code.charCodeAt(i), JSON.stringify(code[i]));
    }
    process.exit(0);
  });
}).on('error', e => { console.log('Error:', e.message); process.exit(1); });