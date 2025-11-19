const fs = require('fs');
const path = require('path');

const basePath = '/pj-insurance';
const serverAppDir = path.join(__dirname, '../.next/server/app');

function fixHtmlPaths(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      fixHtmlPaths(fullPath);
    } else if (file.name.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Fix all asset paths
      content = content.replace(/href="\/_next\//g, `href="${basePath}/_next/`);
      content = content.replace(/src="\/_next\//g, `src="${basePath}/_next/`);
      content = content.replace(/href="\/favicon/g, `href="${basePath}/favicon`);
      content = content.replace(/href="\/quote"/g, `href="${basePath}/quote"`);
      content = content.replace(/href="\/payment"/g, `href="${basePath}/payment"`);
      content = content.replace(/href="\/results"/g, `href="${basePath}/results"`);
      content = content.replace(/href="\/thank-you"/g, `href="${basePath}/thank-you"`);
      content = content.replace(/href="\/"/g, `href="${basePath}/"`);
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Fixed paths in: ${fullPath}`);
    }
  }
}

console.log('Fixing asset paths in HTML files...');
fixHtmlPaths(serverAppDir);
console.log('Done!');

