import 'dotenv/config';
import { chromium } from 'playwright';

function buildEndpoint() {
  const params = new URLSearchParams({
    token: process.env.BOTCLOUD_TOKEN,
    '--proxy-server': process.env.BOTCLOUD_PROXY,
    device_type: process.env.BOTCLOUD_DEVICE || 'mac',
  });
  return `wss://cloud.bots.win?${params.toString()}`;
}

async function main() {
  if (!process.env.BOTCLOUD_TOKEN || !process.env.BOTCLOUD_PROXY) {
    throw new Error('BOTCLOUD_TOKEN and BOTCLOUD_PROXY must be set');
  }

  const browser = await chromium.connectOverCDP(buildEndpoint());
  const context = browser.contexts()[0] ?? await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://example.com');
  await browser.close();
}

main().catch((error) => {
  console.error('BotCloud Playwright sample failed');
  console.error(error);
  process.exit(1);
});
