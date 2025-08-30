const { sdk } = require('./src/lib/config.ts');

console.log('🔍 Debug Environment Variables and Backend Connection\n');

// Check environment variables
console.log('Environment Variables:');
console.log('- MEDUSA_BACKEND_URL:', process.env.MEDUSA_BACKEND_URL ? '✅ SET' : '❌ MISSING');
console.log('- NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ? '✅ SET' : '❌ MISSING');
console.log('- NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL || 'using default');

console.log('\n🔧 SDK Configuration:');
console.log('- Backend URL:', sdk.config.baseUrl);
console.log('- Publishable Key:', sdk.config.publishableKey ? 'SET' : 'MISSING');

console.log('\n📋 Next Steps:');
console.log('1. Deploy this updated code to Vercel');
console.log('2. Check the Vercel function logs for detailed error messages');
console.log('3. Visit: https://revetir.com/sitemap_products_list_0.xml');
console.log('4. The XML should now show either products or specific error messages');

console.log('\n🚨 If still blank, check Vercel logs for:');
console.log('- Environment variable status');
console.log('- Backend connection errors');
console.log('- Region fetching issues');
console.log('- Product fetching errors');
