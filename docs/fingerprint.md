# Fingerprint Management

BotCloud intelligently assigns and manages browser fingerprints to ensure consistent identity across sessions or fresh identities when needed.

---

## How It Works

### With User Data (Persistent Identity)

When you connect with a `user_data_id`, BotCloud binds a fingerprint to the `user_data_id + device_type` combination:

- On first connection, a fingerprint is automatically assigned
- Subsequent sessions with the same combination use the identical fingerprint
- All fingerprint vectors remain consistent across sessions
- The same User Data can be used across different device types, each maintaining its own independent fingerprint

```javascript
const params = new URLSearchParams({
  token: 'your-token',
  '--proxy-server': 'user:pass@proxy.example.com:8080',
  device_type: 'mac',
  user_data_id: 'udd_abc123def456xyz0'  // Fingerprint bound to this + mac
});

const browser = await puppeteer.connect({
  browserWSEndpoint: `wss://cloud.bots.win?${params}`
});
```

### Without User Data (Fresh Identity)

When you connect without a `user_data_id`, BotCloud assigns a fresh fingerprint for each session:

- Each connection receives a newly assigned fingerprint
- Fingerprints are not persisted between sessions
- Ideal for scenarios requiring unique identities per session

```javascript
const params = new URLSearchParams({
  token: 'your-token',
  '--proxy-server': 'user:pass@proxy.example.com:8080',
  device_type: 'mac'
  // No user_data_id = fresh fingerprint every time
});

const browser = await puppeteer.connect({
  browserWSEndpoint: `wss://cloud.bots.win?${params}`
});
```

---

## Multi-Platform Support

The same User Data can be used across different device types. Each `device_type` maintains its own independent fingerprint while sharing browser state (cookies, localStorage):

| Connection | Fingerprint | Browser State |
|------------|-------------|---------------|
| `user_data_id` + `mac` | Fingerprint A (Mac profile) | Shared |
| `user_data_id` + `win` | Fingerprint B (Windows profile) | Shared |
| `user_data_id` + `android` | Fingerprint C (Android profile) | Shared |

---

## Code Examples

### Persistent Identity with User Data

```javascript
import puppeteer from "puppeteer-core";

async function persistentSession(token, proxy, userDataId) {
  const params = new URLSearchParams({
    token,
    "--proxy-server": proxy,
    device_type: "mac",
    user_data_id: userDataId,
  });

  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://cloud.bots.win?${params}`,
  });

  const page = await browser.newPage();
  await page.goto("https://example.com");

  // Your automation code here
  // Fingerprint remains consistent across sessions with same user_data_id

  await browser.close();
}
```

### Multi-Platform with Shared State

```javascript
import puppeteer from "puppeteer-core";

async function multiPlatformExample(token, proxy, userDataId) {
  // Connect as Mac
  const macParams = new URLSearchParams({
    token,
    "--proxy-server": proxy,
    device_type: "mac",
    user_data_id: userDataId,
  });

  let browser = await puppeteer.connect({
    browserWSEndpoint: `wss://cloud.bots.win?${macParams}`,
  });
  let page = await browser.newPage();
  await page.goto("https://example.com");

  // Store data in localStorage (shared across device types)
  await page.evaluate(() => {
    localStorage.setItem("session_data", "shared_value");
  });
  await browser.close();

  // Wait for session cleanup
  await new Promise((r) => setTimeout(r, 5000));

  // Connect as Windows - same localStorage, different fingerprint
  const winParams = new URLSearchParams({
    token,
    "--proxy-server": proxy,
    device_type: "win",
    user_data_id: userDataId,
  });

  browser = await puppeteer.connect({
    browserWSEndpoint: `wss://cloud.bots.win?${winParams}`,
  });
  page = await browser.newPage();
  await page.goto("https://example.com");

  // localStorage is shared across device types
  const sharedData = await page.evaluate(() =>
    localStorage.getItem("session_data")
  );
  console.log(`localStorage shared: ${sharedData === "shared_value"}`);

  await browser.close();
}
```

---

## Summary

| Scenario | Fingerprint | Browser State |
|----------|-------------|---------------|
| With `user_data_id` | Persistent (bound to user_data_id + device_type) | Persistent |
| Without `user_data_id` | Fresh each session | Not persisted |
| Same User Data, different `device_type` | Independent fingerprint per device type | Shared |

---

[← Back to README](../README.md)
