const fs = require('fs');
let html = fs.readFileSync('C:/Users/dailu/Desktop/expert-platform/public/index.html', 'utf8');

// Search for "alert " pattern
const idx = html.indexOf('"alert "');
if (idx > -1) {
  console.log('Found "alert " at index ' + idx);
  const snippet = html.substring(idx-5, idx+130);
  console.log('Snippet:', JSON.stringify(snippet));
} else {
  console.log('"alert " not found');
  // Try finding it without the space
  const idx2 = html.indexOf('alert "');
  if (idx2 > -1) {
    console.log('Found "alert " at index ' + idx2);
    const snippet = html.substring(idx2-5, idx2+130);
    console.log('Snippet:', JSON.stringify(snippet));
  }
}

// Also search in the main script
const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
if (scripts && scripts[6]) {
  const content = scripts[6].replace(/<\/?script[^>]*>/g, '');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('alert') && lines[i].includes('"')) {
      console.log('\nLine ' + (i+1) + ' with alert:');
      console.log(lines[i]);
    }
  }
}
