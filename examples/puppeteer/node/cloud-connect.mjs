import 'dotenv/config';
import puppeteer from 'puppeteer-core';

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

  const browser = await puppeteer.connect({
    browserWSEndpoint: buildEndpoint(),
  });

  const page = await browser.newPage();
  await page.goto('https://example.com', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'screenshot.png' });
  await browser.close();
}

main().catch((error) => {
  console.error('BotCloud Puppeteer sample failed');
  console.error(error);
  process.exit(1);
});
