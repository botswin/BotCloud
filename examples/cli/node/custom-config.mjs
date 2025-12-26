/**
 * BotCloud CLI Parameters Example - Custom Configuration (Node.js)
 *
 * This example demonstrates how to use CLI parameters to customize
 * browser fingerprint, timezone, locale, and noise injection settings.
 *
 * BotCloud supports 50+ CLI parameters for runtime fingerprint configuration.
 * By default, BotCloud auto-detects timezone/locale from your proxy IP.
 * Use CLI parameters when you need specific overrides.
 *
 * Prerequisites:
 *   npm install puppeteer-core
 *
 * Usage:
 *   1. Modify the CONFIG section below with your token and proxy
 *   2. Run: node examples/cli/node/custom-config.mjs
 */

// ============ Configuration (Modify these) ============
const CONFIG = {
  token: "your-token-here",
  proxy: "username:password@proxy.example.com:4600",
  deviceType: "mac", // Device profile: "mac", "win", or "android"

  // Identity overrides (default: auto-detected from proxy IP)
  timezone: "America/New_York",     // Override timezone
  locale: "en-US",                  // Override browser locale
  languages: "en,es",               // Override language preferences

  // Noise injection (recommended for fingerprint protection)
  noiseCanvas: true,                // Canvas fingerprint noise
  noiseWebGL: true,                 // WebGL image noise
  noiseAudio: true,                 // Audio context noise

  // Behavior switches
  disableDebugger: true,            // Ignore debugger statements
};
// ======================================================

import puppeteer from 'puppeteer-core';

function buildEndpoint() {
  if (!CONFIG.token || !CONFIG.proxy) {
    throw new Error('Please configure TOKEN and PROXY in the CONFIG section above');
  }

  // Build parameters object
  const params = new URLSearchParams({
    // Required parameters
    token: CONFIG.token,
    '--proxy-server': CONFIG.proxy,
    device_type: CONFIG.deviceType,

    // Identity parameters
    '--bot-config-timezone': CONFIG.timezone,
    '--bot-config-locale': CONFIG.locale,
    '--bot-config-languages': CONFIG.languages,

    // Noise injection parameters
    '--bot-config-noise-canvas': String(CONFIG.noiseCanvas),
    '--bot-config-noise-webgl-image': String(CONFIG.noiseWebGL),
    '--bot-config-noise-audio-context': String(CONFIG.noiseAudio),

    // Behavior switches
    '--bot-disable-debugger': String(CONFIG.disableDebugger),
  });

  return `wss://cloud.bots.win?${params.toString()}`;
}

async function main() {
  console.log('Configuration:');
  console.log(`  Device: ${CONFIG.deviceType}`);
  console.log(`  Timezone: ${CONFIG.timezone}`);
  console.log(`  Locale: ${CONFIG.locale}`);
  console.log(`  Languages: ${CONFIG.languages}`);
  console.log(`  Canvas noise: ${CONFIG.noiseCanvas}`);
  console.log(`  WebGL noise: ${CONFIG.noiseWebGL}`);
  console.log(`  Audio noise: ${CONFIG.noiseAudio}`);
  console.log('');

  console.log('Connecting to BotCloud...');
  const browser = await puppeteer.connect({
    browserWSEndpoint: buildEndpoint(),
  });

  console.log('Connected! Opening page...');
  const page = await browser.newPage();

  // Navigate to a fingerprint detection site to verify configuration
  console.log('Navigating to fingerprint test page...');
  await page.goto('https://browserleaks.com/javascript', { waitUntil: 'networkidle0' });

  // Extract and display timezone/locale from the page
  const browserInfo = await page.evaluate(() => {
    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: navigator.language,
      languages: navigator.languages.join(', '),
      userAgent: navigator.userAgent,
    };
  });

  console.log('');
  console.log('Browser fingerprint verification:');
  console.log(`  Timezone: ${browserInfo.timezone}`);
  console.log(`  Locale: ${browserInfo.locale}`);
  console.log(`  Languages: ${browserInfo.languages}`);
  console.log(`  User Agent: ${browserInfo.userAgent.substring(0, 80)}...`);

  // Take screenshot for visual verification
  console.log('');
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'cli-config-screenshot.png', fullPage: false });

  console.log('Closing browser...');
  await browser.close();

  console.log('');
  console.log('Done! Check cli-config-screenshot.png for visual verification.');
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
