// Database setup script - Run this on Railway to initialize database
const { execSync } = require('child_process');

console.log('🚀 Starting database setup...');

try {
  console.log('📊 Step 1: Pushing Prisma schema to database...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('✅ Database schema created!');

  console.log('\n🌱 Step 2: Seeding database with products and content...');
  execSync('npx ts-node seed.ts', { stdio: 'inherit' });
  console.log('✅ Database seeded successfully!');

  console.log('\n🎉 Database setup complete!');
  console.log('   - 18 products loaded');
  console.log('   - 3 banners loaded');
  console.log('   - 12 categories loaded');
  console.log('   - Admin account created: admin@roshni.com / admin123');
  console.log('   - Customer account created: nusrat@example.com / customer123');
  
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}
