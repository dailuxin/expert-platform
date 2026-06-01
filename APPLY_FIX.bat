@echo off
cd /d C:\Users\dailu\Desktop\expert-platform
node -e "const fs=require('fs');const h=fs.readFileSync('public/index.html','utf8');const idx=h.indexOf('el.innerHTML=\"<div class=\"alert \"');console.log('Found:',idx);if(idx>-1){const before=h.substring(0,idx);const after=h.substring(idx+'el.innerHTML=\"<div class=\"alert \"'.length);const fixed=before+'el.innerHTML='\\''<div class=\"alert '+after;fs.writeFileSync('public/index.html',fixed,'utf8');console.log('Fixed!');}else{console.log('Not found');}"
pause
