/**
 * BotCloud Quick Start - Puppeteer (Node.js)
 *
 * This is the simplest way to connect to BotCloud using Puppeteer.
 *
 * Prerequisites:
 *   npm install puppeteer-core
 *
 * Usage:
 *   1. Modify the CONFIG section below with your token and proxy
 *   2. Run: node examples/quickstart/puppeteer-node.mjs
 */

// ============ Configuration (Modify these) ============
const CONFIG = {
  token: "your-token-here",
  proxy: "username:password@proxy.example.com:4600",
  deviceType: "mac" // or "win", "android"
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
  console.log('Connecting to BotCloud...');
  const browser = await puppeteer.connect({
    browserWSEndpoint: buildEndpoint(),
  });

  console.log('Connected! Opening page...');
  const page = await browser.newPage();

  console.log('Navigating to example.com...');
  await page.goto('https://example.com', { waitUntil: 'networkidle0' });

  console.log('Taking screenshot...');
  await page.screenshot({ path: 'screenshot.png' });

  console.log('Closing browser...');
  await browser.close();

  console.log('✅ Done! Check screenshot.png');
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
