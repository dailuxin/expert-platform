const https = require('https');
https.get('https://expert-platform-production-626e.up.railway.app/index.html', r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    // Find the script tag content boundary
    const scriptStart = d.indexOf('<script>') + 8;
    const scriptEnd = d.indexOf('</script>');
    const scriptContent = d.substring(scriptStart, scriptEnd);
    
    // Check first and last bytes
    console.log('Total HTML size:', d.length);
    console.log('Script content size:', scriptContent.length);
    console.log('First 20 char codes:', [...scriptContent.substring(0, 20)].map(c => c.charCodeAt(0)));
    console.log('Last 10 char codes:', [...scriptContent.slice(-10)].map(c => c.charCodeAt(0)));
    
    // Check for CRLF
    const lfs = (scriptContent.match(/\n/g) || []).length;
    const crs = (scriptContent.match(/\r/g) || []).length;
    console.log('LF count:', lfs, 'CR count:', crs);
    
    // Check actual line endings
    const firstCrLf = scriptContent.indexOf('\r\n');
    const firstLf = scriptContent.indexOf('\n');
    console.log('First CRLF at:', firstCrLf, 'First LF at:', firstLf);
    
    // Extract scripts the same way Node does
    const scripts = d.match(/<script>([\s\S]*?)<\/script>/g);
    console.log('Script blocks:', scripts ? scripts.length : 0);
    
    process.exit(0);
  });
}).on('error', e => { console.log('Error:', e.message); process.exit(1); });