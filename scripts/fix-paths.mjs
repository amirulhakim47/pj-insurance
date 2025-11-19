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
      // Only replace if it doesn't already have the basePath
      content = content.replace(/href="(?!\/pj-insurance)\/_next\//g, `href="${basePath}/_next/`);
      content = content.replace(/src="(?!\/pj-insurance)\/_next\//g, `src="${basePath}/_next/`);
      content = content.replace(/href="(?!\/pj-insurance)\/favicon/g, `href="${basePath}/favicon`);
      
      // Fix all internal page links - match any href that starts with / but not // or /pj-insurance
      content = content.replace(/href="\/(?!\/|pj-insurance)([^"]*?)"/g, `href="${basePath}/$1"`);
      
      // Fix any remaining specific paths in inline scripts
      content = content.replace(/"p":"\/"/g, `"p":"${basePath}"`);
      content = content.replace(/"p":"\/(?!pj-insurance)/g, `"p":"${basePath}/`);
      
      writeFileSync(fullPath, content, 'utf8');
      console.log(`✓ Fixed: ${fullPath}`);
    }
  }
}

console.log('🔧 Fixing asset paths for GitHub Pages...');
fixHtmlPaths(serverAppDir);
console.log('✅ Done!');

