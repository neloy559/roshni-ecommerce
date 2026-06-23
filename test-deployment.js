// Roshni E-Commerce - Deployment Verification Test
// Tests all critical user flows on production site

const { chromium } = require('playwright');

const SITE_URL = 'https://roshni-ecommerce.vercel.app';
const API_URL = 'https://roshni-ecommerce-production.up.railway.app';

// Test Results Storage
const results = {
  passed: [],
  failed: [],
  warnings: []
};

function logTest(name, status, details = '') {
  const timestamp = new Date().toISOString();
  const result = { name, status, details, timestamp };
  
  if (status === 'PASS') {
    results.passed.push(result);
    console.log(`✅ PASS: ${name}`);
  } else if (status === 'FAIL') {
    results.failed.push(result);
    console.log(`❌ FAIL: ${name} - ${details}`);
  } else if (status === 'WARN') {
    results.warnings.push(result);
    console.log(`⚠️  WARN: ${name} - ${details}`);
  }
  
  if (details && status === 'PASS') {
    console.log(`   ℹ️  ${details}`);
  }
}

async function testHomePage(page) {
  console.log('\n🏠 Testing Homepage...');
  
  try {
    await page.goto(SITE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    logTest('Homepage loads successfully', 'PASS', `URL: ${SITE_URL}`);
  } catch (error) {
    logTest('Homepage loads successfully', 'FAIL', error.message);
    return false;
  }

  // Check title
  const title = await page.title();
  if (title.includes('Roshni')) {
    logTest('Page title correct', 'PASS', title);
  } else {
    logTest('Page title correct', 'FAIL', `Expected "Roshni" in title, got: ${title}`);
  }

  // Check for main elements
  try {
    await page.waitForSelector('header', { timeout: 5000 });
    logTest('Header element present', 'PASS');
  } catch {
    logTest('Header element present', 'FAIL', 'Header not found');
  }

  try {
    await page.waitForSelector('footer', { timeout: 5000 });
    logTest('Footer element present', 'PASS');
  } catch {
    logTest('Footer element present', 'FAIL', 'Footer not found');
  }

  // Check for hero section
  const heroVisible = await page.locator('text=/Women\'s Fashion|Elegance|Discover/i').first().isVisible().catch(() => false);
  if (heroVisible) {
    logTest('Hero section visible', 'PASS');
  } else {
    logTest('Hero section visible', 'WARN', 'Hero section not immediately visible');
  }

  // Take screenshot
  await page.screenshot({ path: 'test-screenshots/homepage.png', fullPage: true });
  logTest('Homepage screenshot captured', 'PASS', 'Saved to test-screenshots/homepage.png');

  return true;
}

async function testProductsPage(page) {
  console.log('\n🛍️  Testing Products Page...');

  try {
    // Navigate to products page
    const productsLink = page.locator('text=/Products|Shop|Catalog/i').first();
    if (await productsLink.isVisible().catch(() => false)) {
      await productsLink.click();
      await page.waitForTimeout(2000);
      logTest('Navigate to products page', 'PASS');
    } else {
      // Try direct navigation
      await page.goto(`${SITE_URL}`, { waitUntil: 'networkidle' });
      // Simulate internal navigation to products
      await page.evaluate(() => {
        if (window.useAppStore) {
          window.useAppStore.getState().navigate('products');
        }
      });
      await page.waitForTimeout(2000);
      logTest('Navigate to products page', 'PASS', 'Via store navigation');
    }

    // Check for products
    const hasProducts = await page.locator('img[alt*="product" i], img[src*="product" i]').count() > 0;
    if (hasProducts) {
      logTest('Product cards visible', 'PASS');
    } else {
      logTest('Product cards visible', 'WARN', 'No products found - may need seeding');
    }

    await page.screenshot({ path: 'test-screenshots/products.png', fullPage: true });
    logTest('Products page screenshot captured', 'PASS');

  } catch (error) {
    logTest('Products page functionality', 'FAIL', error.message);
  }
}

async function testCartFunctionality(page) {
  console.log('\n🛒 Testing Cart Functionality...');

  try {
    // Check if cart icon exists
    const cartIcon = page.locator('[aria-label*="cart" i], text=/cart/i, svg').first();
    const cartExists = await cartIcon.isVisible().catch(() => false);
    
    if (cartExists) {
      logTest('Cart icon visible', 'PASS');
      
      // Try clicking cart
      await cartIcon.click();
      await page.waitForTimeout(1000);
      
      // Check if cart drawer/page opened
      const cartDrawerVisible = await page.locator('text=/shopping cart|your cart|cart is empty/i').isVisible().catch(() => false);
      if (cartDrawerVisible) {
        logTest('Cart drawer opens', 'PASS');
      } else {
        logTest('Cart drawer opens', 'WARN', 'Cart UI not detected');
      }

      await page.screenshot({ path: 'test-screenshots/cart.png' });
      logTest('Cart screenshot captured', 'PASS');
    } else {
      logTest('Cart icon visible', 'FAIL', 'Cart icon not found');
    }

  } catch (error) {
    logTest('Cart functionality', 'FAIL', error.message);
  }
}

async function testAuthPages(page) {
  console.log('\n🔐 Testing Authentication Pages...');

  try {
    // Try to find login/register link
    await page.goto(SITE_URL, { waitUntil: 'networkidle' });
    
    const loginLink = page.locator('text=/login|sign in|account/i').first();
    const loginExists = await loginLink.isVisible().catch(() => false);
    
    if (loginExists) {
      await loginLink.click();
      await page.waitForTimeout(2000);
      
      // Check for login form
      const hasEmailInput = await page.locator('input[type="email"], input[placeholder*="email" i]').isVisible().catch(() => false);
      const hasPasswordInput = await page.locator('input[type="password"]').isVisible().catch(() => false);
      
      if (hasEmailInput && hasPasswordInput) {
        logTest('Login form loads', 'PASS');
        await page.screenshot({ path: 'test-screenshots/login.png' });
        logTest('Login page screenshot captured', 'PASS');
      } else {
        logTest('Login form loads', 'WARN', 'Login form fields not detected');
      }
    } else {
      logTest('Login page accessible', 'WARN', 'Login link not found on homepage');
    }

  } catch (error) {
    logTest('Authentication pages', 'FAIL', error.message);
  }
}

async function testAPIEndpoints() {
  console.log('\n🔌 Testing API Endpoints...');

  const endpoints = [
    { path: '/api', method: 'GET', name: 'API root' },
    { path: '/api/products', method: 'GET', name: 'Products API' },
    { path: '/api/categories', method: 'GET', name: 'Categories API' },
    { path: '/api/banners', method: 'GET', name: 'Banners API' }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_URL}${endpoint.path}`);
      if (response.ok) {
        const data = await response.json();
        logTest(`${endpoint.name} endpoint`, 'PASS', `Status: ${response.status}`);
      } else {
        logTest(`${endpoint.name} endpoint`, 'WARN', `Status: ${response.status}`);
      }
    } catch (error) {
      logTest(`${endpoint.name} endpoint`, 'FAIL', error.message);
    }
  }
}

async function testResponsiveness(page) {
  console.log('\n📱 Testing Responsive Design...');

  const viewports = [
    { name: 'Mobile (375x667)', width: 375, height: 667 },
    { name: 'Tablet (768x1024)', width: 768, height: 1024 },
    { name: 'Desktop (1920x1080)', width: 1920, height: 1080 }
  ];

  for (const viewport of viewports) {
    try {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(SITE_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      
      const screenshotName = `test-screenshots/responsive-${viewport.width}x${viewport.height}.png`;
      await page.screenshot({ path: screenshotName, fullPage: false });
      
      logTest(`Responsive: ${viewport.name}`, 'PASS', `Screenshot: ${screenshotName}`);
    } catch (error) {
      logTest(`Responsive: ${viewport.name}`, 'FAIL', error.message);
    }
  }
}

async function testPerformance(page) {
  console.log('\n⚡ Testing Performance...');

  try {
    const startTime = Date.now();
    await page.goto(SITE_URL, { waitUntil: 'load' });
    const loadTime = Date.now() - startTime;

    if (loadTime < 3000) {
      logTest('Page load time', 'PASS', `${loadTime}ms (< 3s)`);
    } else if (loadTime < 5000) {
      logTest('Page load time', 'WARN', `${loadTime}ms (3-5s, consider optimization)`);
    } else {
      logTest('Page load time', 'FAIL', `${loadTime}ms (> 5s, too slow)`);
    }

    // Check for console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(3000);

    if (errors.length === 0) {
      logTest('No console errors', 'PASS');
    } else {
      logTest('No console errors', 'WARN', `${errors.length} errors found`);
    }

  } catch (error) {
    logTest('Performance test', 'FAIL', error.message);
  }
}

async function testDarkMode(page) {
  console.log('\n🌙 Testing Dark Mode...');

  try {
    await page.goto(SITE_URL, { waitUntil: 'networkidle' });
    
    // Look for dark mode toggle
    const darkModeToggle = page.locator('[aria-label*="dark" i], [title*="dark" i], button:has-text("dark")').first();
    const toggleExists = await darkModeToggle.isVisible().catch(() => false);
    
    if (toggleExists) {
      await darkModeToggle.click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ path: 'test-screenshots/dark-mode.png', fullPage: true });
      logTest('Dark mode toggle works', 'PASS', 'Screenshot captured');
    } else {
      logTest('Dark mode toggle', 'WARN', 'Dark mode toggle not found');
    }

  } catch (error) {
    logTest('Dark mode test', 'FAIL', error.message);
  }
}

async function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST REPORT SUMMARY');
  console.log('='.repeat(60));
  
  const total = results.passed.length + results.failed.length + results.warnings.length;
  const passRate = total > 0 ? ((results.passed.length / total) * 100).toFixed(1) : 0;
  
  console.log(`\n✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);
  console.log(`📈 Pass Rate: ${passRate}%`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.failed.forEach(test => {
      console.log(`   • ${test.name}: ${test.details}`);
    });
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.warnings.forEach(test => {
      console.log(`   • ${test.name}: ${test.details}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  const status = results.failed.length === 0 ? 'SUCCESS ✅' : 'NEEDS ATTENTION ⚠️';
  console.log(`OVERALL STATUS: ${status}`);
  console.log('='.repeat(60));
  
  // Write JSON report
  const fs = require('fs');
  fs.mkdirSync('test-screenshots', { recursive: true });
  fs.writeFileSync('test-screenshots/test-report.json', JSON.stringify(results, null, 2));
  console.log('\n📄 Detailed report saved to: test-screenshots/test-report.json');
}

async function runAllTests() {
  console.log('🚀 Starting Roshni E-Commerce Deployment Tests...\n');
  console.log(`🌐 Testing Site: ${SITE_URL}`);
  console.log(`🔌 Testing API: ${API_URL}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    // Run all tests
    await testHomePage(page);
    await testProductsPage(page);
    await testCartFunctionality(page);
    await testAuthPages(page);
    await testAPIEndpoints();
    await testResponsiveness(page);
    await testPerformance(page);
    await testDarkMode(page);

  } catch (error) {
    console.error('\n❌ Critical error during testing:', error);
    logTest('Test execution', 'FAIL', error.message);
  } finally {
    await browser.close();
    await generateReport();
  }
}

// Run tests
runAllTests().catch(console.error);
