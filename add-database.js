// Automated script to add PostgreSQL database to Railway
const { chromium } = require('playwright');

async function addDatabase() {
  console.log('🚀 Starting Railway automation...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Go to Railway project
    await page.goto('https://railway.app/project/0c48c7d2-b0fe-4ca6-98ef-20671ef08578');
    console.log('📍 Navigated to Railway project');

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Look for "+ New Service" button
    console.log('🔍 Looking for "+ New Service" button...');
    const newServiceButton = await page.locator('text="New Service"').first();
    
    if (await newServiceButton.isVisible()) {
      await newServiceButton.click();
      console.log('✅ Clicked "+ New Service"');
      
      await page.waitForTimeout(1000);
      
      // Look for "Database" option
      const databaseOption = await page.locator('text="Database"').first();
      if (await databaseOption.isVisible()) {
        await databaseOption.click();
        console.log('✅ Selected "Database"');
        
        await page.waitForTimeout(1000);
        
        // Look for "PostgreSQL" option
        const postgresOption = await page.locator('text="PostgreSQL"').first();
        if (await postgresOption.isVisible()) {
          await postgresOption.click();
          console.log('✅ Selected "PostgreSQL"');
          
          await page.waitForTimeout(5000);
          console.log('✅ PostgreSQL database should be created!');
        }
      }
    }

    console.log('\n📸 Taking screenshot...');
    await page.screenshot({ path: 'railway-database-added.png', fullPage: true });
    console.log('✅ Screenshot saved: railway-database-added.png');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'railway-error.png', fullPage: true });
  } finally {
    console.log('\n⏸️  Browser will stay open for 10 seconds so you can see the result...');
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

addDatabase();
