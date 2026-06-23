// Safe API fix script - properly handles getApiUrl
const fs = require('fs');
const path = require('path');

const files = [
  'src/components/store/HomePage.tsx',
  'src/components/store/ProductsPage.tsx',
  'src/components/store/ProductDetailPage.tsx',
  'src/components/store/Header.tsx',
  'src/components/store/CheckoutPage.tsx',
  'src/components/store/CartPage.tsx',
  'src/components/store/AuthPages.tsx',
  'src/components/store/AccountPage.tsx',
  'src/components/store/WishlistPage.tsx',
  'src/components/admin/AdminDashboard.tsx'
];

console.log('🔧 Fixing API calls safely...\n');

files.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Skip: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;
  
  // Add import if missing
  if (!content.includes("from '@/lib/api-config'")) {
    const lines = content.split('\n');
    let insertIndex = -1;
    
    // Find last import line
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ') && lines[i].includes('from ')) {
        insertIndex = i;
      }
    }
    
    if (insertIndex > -1) {
      lines.splice(insertIndex + 1, 0, "import { getApiUrl } from '@/lib/api-config';");
      content = lines.join('\n');
    }
  }
  
  // Replace fetch('/api/... with fetch(getApiUrl('/api/...
  content = content.replace(
    /fetch\(\s*['"]\/api\//g,
    "fetch(getApiUrl('/api/"
  );
  
  // Replace fetch(`/api/... with fetch(getApiUrl(`/api/...
  content = content.replace(
    /fetch\(\s*`\/api\//g,
    "fetch(getApiUrl(`/api/"
  );
  
  // Add closing parenthesis for getApiUrl
  content = content.replace(
    /fetch\(getApiUrl\((['"`])\/api\/([^'"`\)]+)\1\)/g,
    "fetch(getApiUrl($1/api/$2$1))"
  );
  
  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`⏭️  No changes: ${filePath}`);
  }
});

console.log('\n✨ Complete!');
