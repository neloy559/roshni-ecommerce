// Fix body: JSON.stringify(...)) - remove the extra closing paren
// Pattern: body: JSON.stringify({ ... })) → body: JSON.stringify({ ... })

const fs = require('fs');
const path = require('path');

const files = [
  'src/components/admin/AdminDashboard.tsx',
  'src/components/store/AccountPage.tsx',
  'src/components/store/AuthPages.tsx',
  'src/components/store/CartPage.tsx',
  'src/components/store/CheckoutPage.tsx',
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

  // Fix: body: JSON.stringify({ ... })), → body: JSON.stringify({ ... }),
  // The pattern is: })) followed by comma or closing brace → should be }) followed by comma/brace
  const pattern = /body:\s*JSON\.stringify\(([^)]+)\)\),/g;
  const matches = content.match(pattern);
  
  if (matches) {
    content = content.replace(/body:\s*JSON\.stringify\(([^)]+)\)\),/g, 'body: JSON.stringify($1),');
    modified = true;
    console.log(`✅ Fixed JSON.stringify in ${file} (${matches.length} occurrences)`);
  }

  // Also check for })) at end of options object (before });)
  const pattern2 = /body:\s*JSON\.stringify\(([^)]+\})\)\)\s*\}/g;
  const matches2 = content.match(pattern2);
  
  if (matches2) {
    content = content.replace(/body:\s*JSON\.stringify\(([^)]+\})\)\)\s*\}/g, 'body: JSON.stringify($1) }');
    modified = true;
    console.log(`✅ Fixed JSON.stringify end-of-object in ${file}`);
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Saved ${file}`);
  } else {
    console.log(`✓  ${file} (no changes needed)`);
  }
});

console.log('\n✅ All JSON.stringify syntax errors fixed!');
