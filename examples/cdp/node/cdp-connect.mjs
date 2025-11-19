// Run with: npm install dotenv ws && node examples/cdp/node/cdp-connect.mjs
import 'dotenv/config';
import WebSocket from 'ws';
import { writeFileSync } from 'node:fs';

function buildEndpoint() {
  const params = new URLSearchParams({
    token: process.env.BOTCLOUD_TOKEN,
    '--proxy-server': process.env.BOTCLOUD_PROXY,
    device_type: process.env.BOTCLOUD_DEVICE || 'mac',
  });
  return `wss://cloud.bots.win?${params.toString()}`;
}

function createCDPClient(ws) {
  let idCounter = 0;
  const pending = new Map();

  ws.on('message', (data) => {
    const payload = JSON.parse(data.toString());
    if (payload.id && pending.has(payload.id)) {
      const { resolve, reject } = pending.get(payload.id);
      pending.delete(payload.id);
      if (payload.error) {
        reject(new Error(payload.error.message));
      } else {
        resolve(payload.result);
      }
      return;
    }
  });

  const call = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = ++idCounter;
      const message = { id, method, params };
      if (sessionId) message.sessionId = sessionId;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify(message));
    });

  return call;
}

async function main() {
  if (!process.env.BOTCLOUD_TOKEN || !process.env.BOTCLOUD_PROXY) {
    throw new Error('BOTCLOUD_TOKEN and BOTCLOUD_PROXY must be set');
  }

  const ws = new WebSocket(buildEndpoint());

  const ready = new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
  });

  await ready;
  const cdpCall = createCDPClient(ws);

  try {
    const { targetId } = await cdpCall('Target.createTarget', {
      url: 'about:blank',
    });

    const { sessionId } = await cdpCall('Target.attachToTarget', {
      targetId,
      flatten: true,
    });

    await cdpCall('Page.enable', {}, sessionId);
    await cdpCall('Page.navigate', { url: 'https://example.com' }, sessionId);
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const { data } = await cdpCall('Page.captureScreenshot', {}, sessionId);
    writeFileSync('cdp-screenshot.png', Buffer.from(data, 'base64'));

    await cdpCall('Target.closeTarget', { targetId });
  } finally {
    ws.close();
  }
}

main().catch((error) => {
  console.error('BotCloud CDP sample failed');
  console.error(error);
  process.exit(1);
});
