import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const basePath = '/pj-insurance';
const serverAppDir = '.next/server/app';

function fixHtmlPaths(dir) {
  const files = readdirSync(dir);
  
  for (const file of files) {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      fixHtmlPaths(fullPath);
    } else if (file.endsWith('.html')) {
      let content = readFileSync(fullPath, 'utf8');
      
      // Fix all asset paths - be very specific to avoid double-prefixing
      content = content.replace(/href="\/_next\//g, `href="${basePath}/_next/`);
      content = content.replace(/src="\/_next\//g, `src="${basePath}/_next/`);
      content = content.replace(/href="\/favicon/g, `href="${basePath}/favicon`);
      content = content.replace(/href="\/quote"/g, `href="${basePath}/quote"`);
      content = content.replace(/href="\/payment/g, `href="${basePath}/payment`);
      content = content.replace(/href="\/results"/g, `href="${basePath}/results"`);
      content = content.replace(/href="\/thank-you"/g, `href="${basePath}/thank-you"`);
      content = content.replace(/href="\/loading"/g, `href="${basePath}/loading"`);
      // Fix home link
      content = content.replace(/href="\/">/g, `href="${basePath}/">`);
      
      writeFileSync(fullPath, content, 'utf8');
      console.log(`✓ Fixed: ${fullPath}`);
    }
  }
}

console.log('🔧 Fixing asset paths for GitHub Pages...');
fixHtmlPaths(serverAppDir);
console.log('✅ Done!');

