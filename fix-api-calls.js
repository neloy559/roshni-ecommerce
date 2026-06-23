// Script to fix all API calls to use Railway backend
const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/components/store/WishlistPage.tsx',
  'src/components/store/ProductsPage.tsx',
  'src/components/store/HomePage.tsx',
  'src/components/store/Header.tsx',
  'src/components/store/CheckoutPage.tsx',
  'src/components/store/CartPage.tsx',
  'src/components/store/AuthPages.tsx',
  'src/components/store/AccountPage.tsx',
  'src/components/store/ProductDetailPage.tsx',
  'src/components/admin/AdminDashboard.tsx'
];

console.log('🔧 Fixing API calls to use Railway backend...\n');

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;
  
  // Add import if not present
  if (!content.includes('getApiUrl')) {
    // Find the last import statement
    const importRegex = /^import .* from .*;\s*$/gm;
    const imports = content.match(importRegex);
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const newImport = "import { getApiUrl } from '@/lib/api-config';\n";
      content = content.replace(lastImport, lastImport + newImport);
      changed = true;
    }
  }
  
  // Replace fetch calls
  const originalContent = content;
  content = content.replace(/fetch\('\/api\//g, "fetch(getApiUrl('/api/");
  content = content.replace(/fetch\(`\/api\//g, "fetch(getApiUrl(`/api/");
  
  if (content !== originalContent) {
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`⏭️  Skipped (no changes): ${filePath}`);
  }
});

console.log('\n✨ API call fixes complete!');
