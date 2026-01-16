/**
 * BotCloud DevTools Example - Playwright (Node.js)
 *
 * This example demonstrates how to use DevTools to debug and inspect
 * automation in real-time using Chrome DevTools. This is perfect for:
 * - Debugging automation scripts
 * - Inspecting DOM and network requests
 * - Solving CAPTCHAs with human assistance
 * - Handling two-factor authentication
 *
 * Prerequisites:
 *   npm install playwright
 *
 * Usage:
 *   1. Modify the CONFIG section below with your token and proxy
 *   2. Run: node examples/devtools/node/playwright-devtools.mjs
 *   3. Open the displayed DevTools URL in your browser
 *   4. Use Chrome DevTools to inspect and debug
 *   5. Wait for timeout or close browser to continue
 */

// ============ Configuration (Modify these) ============
const CONFIG = {
  token: "your-token-here",
  proxy: "username:password@proxy.example.com:4600",
  deviceType: "mac", // or "win", "android"
  devtoolsTimeout: 120000, // 2 minutes (in milliseconds)
};
// ======================================================

import { chromium } from 'playwright';

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
  console.log('BotCloud DevTools Example - Playwright');
  console.log('='.repeat(60));

  let browser;
  try {
    // Connect to BotCloud
    console.log('\n🌐 Connecting to BotCloud...');
    browser = await chromium.connectOverCDP(buildEndpoint());
    console.log('✅ Connected!');

    // Get or create context
    console.log('\n📂 Getting browser context...');
    const context = browser.contexts()[0] || await browser.newContext();
    const page = await context.newPage();
    console.log('✅ Context and page ready');

    // Navigate to a page (example)
    console.log('\n🔗 Navigating to httpbin.org/forms/post...');
    await page.goto('https://httpbin.org/forms/post', { waitUntil: 'networkidle' });
    console.log('✅ Page loaded');

    // Create CDP session for DevTools
    console.log('\n🔌 Creating CDP session...');
    const cdp = await context.newCDPSession(page);
    console.log('✅ CDP session created');

    // Set up completion handler BEFORE requesting DevTools
    console.log('\n👂 Setting up devtoolsComplete event handler...');
    const completionPromise = new Promise((resolve) => {
      cdp.on('devtoolsComplete', () => {
        console.log('\n✅ DevTools session ended!');
        resolve();
      });
    });

    // Request DevTools
    console.log(`\n🔗 Requesting DevTools (timeout: ${CONFIG.devtoolsTimeout / 1000}s)...`);
    const { devtoolsURL } = await cdp.send('devtools', {
      timeout: CONFIG.devtoolsTimeout
    });

    // Display the DevTools URL
    console.log('\n' + '='.repeat(60));
    console.log('🎯 DevTools URL Generated!');
    console.log('='.repeat(60));
    console.log('\n📱 Open this URL in your browser:');
    console.log(`\n   ${devtoolsURL}\n`);
    console.log('Instructions:');
    console.log('  1. Open the URL above in any web browser');
    console.log('  2. You will see the Chrome DevTools interface');
    console.log('  3. Use Elements, Console, Network tabs to inspect');
    console.log('  4. You can execute JavaScript in the Console');
    console.log('  5. Session ends automatically after timeout');
    console.log('\n⏳ Waiting for DevTools session to complete...\n');

    // Wait for session to complete
    await completionPromise;

    // Continue automation after DevTools session
    console.log('\n🤖 Resuming automation...');
    console.log('📄 Checking page state...');

    const currentUrl = page.url();
    const pageTitle = await page.title();
    console.log(`   Current URL: ${currentUrl}`);
    console.log(`   Page title: ${pageTitle}`);

    // Example: Extract form data
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
  console.log('  • DevTools provides full Chrome DevTools for debugging');
  console.log('  • Perfect for inspecting DOM, network, console');
  console.log('  • Use CDP session to request DevTools and listen for completion');
  console.log('  • DevTools session time counts toward quota usage');
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
