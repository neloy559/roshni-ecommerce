// Fix fetch(getApiUrl(...), {...}) calls - need to add closing paren before the options object
// Pattern: fetch(getApiUrl('/path', { options }) → needs to be fetch(getApiUrl('/path'), { options })

const fs = require('fs');
const path = require('path');

const files = [
  'src/components/admin/AdminDashboard.tsx',
  'src/components/store/AccountPage.tsx',
  'src/components/store/AuthPages.tsx',
  'src/components/store/CartPage.tsx',
  'src/components/store/CheckoutPage.tsx',
  'src/components/store/Header.tsx',
  'src/components/store/ProductDetailPage.tsx',
  'src/components/store/ProductsPage.tsx',
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  Skipping ${file} (not found)`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix pattern 1: fetch(getApiUrl('/path', { method: ... }) → fetch(getApiUrl('/path'), { method: ... })
  // This is for fetch calls with options object
  const pattern1 = /fetch\(getApiUrl\(('[^']+'),\s*\{/g;
  if (pattern1.test(content)) {
    content = content.replace(/fetch\(getApiUrl\(('[^']+'),\s*\{/g, 'fetch(getApiUrl($1), {');
    modified = true;
    console.log(`✅ Fixed fetch options in ${file}`);
  }

  // Fix pattern 2: fetch(getApiUrl(`...`), { already correct but check for missing paren
  const pattern2 = /fetch\(getApiUrl\((`[^`]+`),\s*\{/g;
  if (pattern2.test(content)) {
    content = content.replace(/fetch\(getApiUrl\((`[^`]+`),\s*\{/g, 'fetch(getApiUrl($1), {');
    modified = true;
    console.log(`✅ Fixed fetch template in ${file}`);
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${file}`);
  } else {
    console.log(`✓  ${file} (no changes needed)`);
  }
});

console.log('\n✅ All fetch option syntax errors fixed!');
