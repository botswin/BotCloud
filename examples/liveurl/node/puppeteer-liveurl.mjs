/**
 * BotCloud LiveURL Example - Puppeteer (Node.js)
 *
 * This example demonstrates how to use LiveURL to pause automation and let
 * a human interact with the browser in real-time. This is perfect for:
 * - Solving CAPTCHAs
 * - Handling two-factor authentication
 * - Manual login flows
 * - Debugging automation scripts
 *
 * Prerequisites:
 *   npm install puppeteer-core
 *
 * Usage:
 *   1. Modify the CONFIG section below with your token and proxy
 *   2. Run: node examples/liveurl/node/puppeteer-liveurl.mjs
 *   3. Open the displayed LiveURL in your browser
 *   4. Interact with the page (it will show live updates)
 *   5. Click "Done" when finished
 *   6. Script will continue automatically
 */

// ============ Configuration (Modify these) ============
const CONFIG = {
  token: "your-token-here",
  proxy: "username:password@proxy.example.com:4600",
  deviceType: "mac", // or "win", "android"
  liveTimeout: 120000, // 2 minutes (in milliseconds)
};
// ======================================================

import puppeteer from 'puppeteer-core';

function buildEndpoint() {
  if (!CONFIG.token || !CONFIG.proxy) {
    throw new Error('Please configure TOKEN and PROXY in the CONFIG section above');
  }

  const params = new URLSearchParams({
    token: CONFIG.token,
    '--proxy-server': CONFIG.proxy,
    device_type: CONFIG.deviceType,
  });
  return `wss://cloud.bots.win?${params.toString()}`;
}

async function main() {
  console.log('='.repeat(60));
  console.log('BotCloud LiveURL Example - Puppeteer');
  console.log('='.repeat(60));

  let browser;
  try {
    // Connect to BotCloud
    console.log('\n🌐 Connecting to BotCloud...');
    browser = await puppeteer.connect({
      browserWSEndpoint: buildEndpoint(),
    });
    console.log('✅ Connected!');

    // Create a new page
    console.log('\n📄 Opening new page...');
    const page = await browser.newPage();

    // Navigate to a login page (example)
    console.log('🔗 Navigating to example.com/login...');
    await page.goto('https://httpbin.org/forms/post', { waitUntil: 'networkidle0' });
    console.log('✅ Page loaded');

    // Create CDP session for LiveURL
    console.log('\n🔌 Creating CDP session...');
    const cdp = await page.createCDPSession();
    console.log('✅ CDP session created');

    // Set up completion handler BEFORE requesting LiveURL
    console.log('\n👂 Setting up liveComplete event handler...');
    const completionPromise = new Promise((resolve) => {
      cdp.on('liveComplete', () => {
        console.log('\n✅ User completed interaction!');
        resolve();
      });
    });

    // Request LiveURL
    console.log(`\n🔗 Requesting LiveURL (timeout: ${CONFIG.liveTimeout / 1000}s)...`);
    const { liveURL } = await cdp.send('liveURL', {
      timeout: CONFIG.liveTimeout
    });

    // Display the LiveURL
    console.log('\n' + '='.repeat(60));
    console.log('🎯 LiveURL Generated!');
    console.log('='.repeat(60));
    console.log('\n📱 Open this URL in your browser:');
    console.log(`\n   ${liveURL}\n`);
    console.log('Instructions:');
    console.log('  1. Open the URL above in any web browser');
    console.log('  2. You will see a live view of the browser page');
    console.log('  3. You can click, type, and interact normally');
    console.log('  4. Try filling out the form or navigating around');
    console.log('  5. Click the "Done" button when finished');
    console.log('\n⏳ Waiting for you to complete interaction...\n');

    // Wait for user to complete
    await completionPromise;

    // Continue automation after user interaction
    console.log('\n🤖 Resuming automation...');
    console.log('📄 Checking page state after user interaction...');

    const currentUrl = page.url();
    const pageTitle = await page.title();
    console.log(`   Current URL: ${currentUrl}`);
    console.log(`   Page title: ${pageTitle}`);

    // Example: Extract form data if user filled it
    const formData = await page.evaluate(() => {
      const form = document.querySelector('form');
      if (!form) return null;

      const data = {};
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        if (input.name) {
          data[input.name] = input.value;
        }
      });
      return data;
    });

    if (formData && Object.keys(formData).length > 0) {
      console.log('\n📝 Form data detected:');
      console.log(JSON.stringify(formData, null, 2));
    }

    console.log('\n✅ Automation complete!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;

  } finally {
    if (browser) {
      console.log('\n🔒 Closing browser...');
      await browser.close();
      console.log('✅ Browser closed');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Example completed successfully!');
  console.log('='.repeat(60));
  console.log('\nKey takeaways:');
  console.log('  • LiveURL lets humans interact during automation');
  console.log('  • Perfect for CAPTCHAs, 2FA, and manual steps');
  console.log('  • Use CDP session to request LiveURL and listen for completion');
  console.log('  • User interaction time counts toward quota usage');
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
