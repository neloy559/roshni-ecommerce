// Fix syntax errors in fetch(getApiUrl(...)) calls
// Pattern: fetch(getApiUrl('/path') needs to be fetch(getApiUrl('/path'))
// Problem: Script replaced fetch('/api/xxx' with fetch(getApiUrl('/api/xxx' missing closing paren

const fs = require('fs');
const path = require('path');

const files = [
  'src/components/admin/AdminDashboard.tsx',
  'src/components/store/AccountPage.tsx',
  'src/components/store/AuthPages.tsx',
  'src/components/store/CartPage.tsx',
  'src/components/store/CheckoutPage.tsx',
  'src/components/store/Header.tsx',
  'src/components/store/HomePage.tsx',
  'src/components/store/ProductDetailPage.tsx',
  'src/components/store/ProductsPage.tsx',
  'src/components/store/WishlistPage.tsx',
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  Skipping ${file} (not found)`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix pattern: fetch(getApiUrl('/api/xxx'  → needs closing paren
  // Match: fetch(getApiUrl('...')  (without the second closing paren)
  // Replace with: fetch(getApiUrl('...'))
  
  const pattern1 = /fetch\(getApiUrl\(([^)]+)\)(?!\))/g;
  if (pattern1.test(content)) {
    content = content.replace(pattern1, 'fetch(getApiUrl($1))');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${file}`);
  } else {
    console.log(`✓  ${file} (no changes needed)`);
  }
});

console.log('\n✅ All syntax errors fixed!');
