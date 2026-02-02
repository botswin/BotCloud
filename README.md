<h1 align="center"><img src="assets/cloud-icon.svg" width="32" height="32" alt="BotCloud"> BotCloud</h1>

<h4 align="center">Hosted Privacy Browser Gateway for teams validating fingerprint defenses</h4>

<p align="center">
  🛡️ <strong>Fingerprint Defense</strong> - Validated against 31+ detection systems<br>
  ⚡ <strong>Zero Config</strong> - Auto-detects timezone, locale, language from proxy IP<br>
  🔍 <strong>DevTools</strong> - Remote browser debugging via Chrome DevTools
</p>

---

Connect to cloud Chrome with your familiar Puppeteer or Playwright code — no deployment, no maintenance, fingerprint-level isolation. BotCloud isolates your real device fingerprint from third-party tracking while helping teams validate their fingerprint defense mechanisms.

**Why privacy teams pick BotCloud:**

- **Protect local device fingerprints** - Cloud-based isolation prevents your device fingerprint from being exposed to third-party tracking and fingerprinting.
- No more desktop babysitting because cloud browsers stay patched and geo-distributed out of the box.
- Existing scripts keep working (Puppeteer, Playwright, Selenium, CDP) with minimal tweaks for privacy testing.
- Mandatory proxy plus region controls with usage-based billing make compliance reviews easy.

> 💡 **Pricing:** Usage-based billing at **$0.6/hour** (1 quota = 1 minute). Dynamic multiplier based on concurrent sessions, Cloak Tier, and premium features. **[View pricing details →](https://bots.win/en/pricing/)**
> ⚖️ Review the [Legal Disclaimer](DISCLAIMER.md) and [Responsible Use Guidelines](RESPONSIBLE_USE.md) before onboarding.

**🌐 Learn more:** Visit **[bots.win](https://bots.win)** for documentation, pricing, and support.

---

## Quick Start

```javascript
import puppeteer from "puppeteer-core";

const params = new URLSearchParams({
  token: process.env.BOTCLOUD_TOKEN,
  "--proxy-server": process.env.BOTCLOUD_PROXY,
  device_type: "mac",
});

const browser = await puppeteer.connect({
  browserWSEndpoint: `wss://cloud.bots.win?${params.toString()}`,
});
const page = await browser.newPage();
await page.goto("https://example.com");
await browser.close();
```

1. **Get a token** from your service provider
2. **Prepare a proxy** in format `username:password@host:port`
3. **Connect** using Puppeteer, Playwright, or CDP
4. **Close** the browser when done to free quota

---

## Why BotCloud

### Fingerprint Defense Validation

| Detection System | Status |
|------------------|--------|
| CreepJS | ✅ Verified |
| Cloudflare Turnstile | ✅ Verified |
| DataDome | ✅ Verified |
| FingerprintJS Pro | ✅ Verified |
| PerimeterX | ✅ Verified |
| Kasada | ✅ Verified |

Our fingerprint engine maintains consistency across 31+ detection vectors including canvas, WebGL, audio context, font enumeration, and hardware concurrency.

- Intelligent fingerprint binding with User Data for persistent identity
- Fresh fingerprint assignment for each session without User Data

**[View Fingerprint Management Guide →](docs/fingerprint.md)**

### Zero-Configuration Intelligence

BotCloud auto-detects timezone, language, and locale from your proxy IP:

```javascript
// Just provide your proxy - we handle the rest
const params = new URLSearchParams({
  token: process.env.BOTCLOUD_TOKEN,
  "--proxy-server": "user:pass@tokyo-proxy.example.com:8080"
});
// Browser automatically uses Asia/Tokyo timezone, ja-JP locale
```

### Privacy-Preserving Automation

- Your local device fingerprint stays isolated in the cloud—third parties never see your real device
- No `navigator.webdriver` flag
- No Chrome DevTools Protocol exposure points
- WebRTC and DNS requests route through your proxy
- Zero IP leaks from any browser API

---

## Connection Parameters

| Parameter | Example | Required |
|-----------|---------|----------|
| `token` | `user-token-abc123` | ✅ |
| `--proxy-server` | `user:pass@proxy.example.com:4600` | ✅ |
| `device_type` | `mac` / `win` / `android` | Optional (default: `mac`) |
| `user_data_id` | `udd_xxxxxxxxxxxx` | Optional |
| `super_stealth` | `true` / `false` | Optional (requires Super Stealth access) |

### Premium Features

| Feature | Parameter | Description | Premium |
|---------|-----------|-------------|---------|
| **Super Stealth Mode** | `super_stealth=true` | Maximum anti-detection capability | +0.40x |
| **DevTools** | See [DevTools docs](docs/devtools.md) | Remote browser debugging via Chrome DevTools | +0.35x |
| **Multi-Context** | CDP: `Target.createBrowserContext` | Up to 10 independent contexts per session, each with isolated fingerprint | 1.5x (ENT3 required) |

BotCloud supports 50+ CLI parameters for timezone, locale, fingerprint variation, and more.

**📖 [View full CLI parameter reference →](docs/cli-parameters.md)**

---

## DevTools - Remote Browser Debugging

DevTools provides remote access to Chrome DevTools for debugging automated workflows.

```javascript
const cdp = await page.createCDPSession();
cdp.on("devtoolsComplete", () => console.log("Session complete"));

const { devtoolsURL } = await cdp.send("devtools", { timeout: 120000 });
console.log(`Open: ${devtoolsURL}`);

await new Promise(resolve => cdp.on("devtoolsComplete", resolve));
```

**📖 [View full DevTools documentation →](docs/devtools.md)**

---

## Multi-Context - Independent Fingerprints <sup>ENT3</sup>

Multi-Context enables up to 10 independent browser contexts within a single session, each with its own fingerprint configuration. Ideal for multi-account management and parallel identity isolation.

```javascript
// Create context with independent fingerprint
const { browserContextId } = await cdp.send('Target.createBrowserContext', {
  botCloudFlags: [
    '--new-profile=mac',           // Fresh fingerprint (mac/win/android)
    '--bot-config-timezone=Asia/Tokyo',
    '--proxy-ip=103.x.x.x'
  ]
});

// Create target in the new context
const { targetId } = await cdp.send('Target.createTarget', {
  url: 'about:blank',
  browserContextId
});
```

**Key Features:**
- Up to 10 contexts per session (vs 1 for standard accounts)
- Each context can have its own timezone, locale, proxy IP
- Fresh fingerprint via `--new-profile` parameter
- Context isolation prevents cross-contamination

**📖 [View full Multi-Context documentation →](docs/cli-parameters.md#multi-context-ent3)**

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/quota` | GET | Check remaining quota |
| `/api/usage` | GET | Get usage statistics |
| `/api/history` | GET | Retrieve session history |
| `/api/user-data` | POST | Create persistent User Data |
| `/api/user-data` | GET | List User Data entries |
| `/api/user-data/:id` | DELETE | Delete User Data |

**📖 [View full API reference →](docs/api-reference.md)**

---

## Examples

| Framework | Language | Example |
|-----------|----------|---------|
| Puppeteer | Node.js | [`examples/puppeteer/node/quickstart.mjs`](examples/puppeteer/node/quickstart.mjs) |
| Playwright | Node.js | [`examples/playwright/node/quickstart.mjs`](examples/playwright/node/quickstart.mjs) |
| Playwright | Python | [`examples/playwright/python/quickstart.py`](examples/playwright/python/quickstart.py) |
| CLI Config | Node.js | [`examples/cli/node/custom-config.mjs`](examples/cli/node/custom-config.mjs) |
| DevTools | Node.js | [`examples/devtools/node/puppeteer-devtools.mjs`](examples/devtools/node/puppeteer-devtools.mjs) |
| User Data | Node.js | [`examples/user-data/node/user-data.mjs`](examples/user-data/node/user-data.mjs) |
| CDP | Go | [`examples/cdp/go/chromedp-quickstart.go`](examples/cdp/go/chromedp-quickstart.go) |
| CDP | Java | [`examples/cdp/java/CdpQuickstart.java`](examples/cdp/java/CdpQuickstart.java) |
| CDP | Ruby | [`examples/cdp/ruby/ferrum-quickstart.rb`](examples/cdp/ruby/ferrum-quickstart.rb) |

**📖 [View all examples →](examples/README.md)**

---

## Multi-Language Support

BotCloud supports direct CDP connections from any language with WebSocket support:

| Language | Library | Example |
|----------|---------|---------|
| **Go** | chromedp (recommended) | [`examples/cdp/go/chromedp-quickstart.go`](examples/cdp/go/chromedp-quickstart.go) |
| **Go** | rod (low-level API) | [`examples/cdp/go/rod-quickstart.go`](examples/cdp/go/rod-quickstart.go) |
| **Java** | Native WebSocket (Java 11+) | [`examples/cdp/java/CdpQuickstart.java`](examples/cdp/java/CdpQuickstart.java) |
| **Ruby** | Ferrum | [`examples/cdp/ruby/ferrum-quickstart.rb`](examples/cdp/ruby/ferrum-quickstart.rb) |

Each example includes detailed comments explaining library-specific considerations and compatibility notes.

---

## Operations

### Connection Limits

BotCloud enforces **one active connection per token**. For parallel sessions, request multiple tokens from your service provider.

### Graceful Shutdown

Always wrap browser operations in `try/finally`:

```javascript
let browser;
try {
  browser = await puppeteer.connect({ browserWSEndpoint });
  // Your automation here
} finally {
  if (browser) await browser.close();
}
```

### Monitoring

Track these metrics:
- **Remaining quota** - Alert below 10 units
- **Active sessions** - Track concurrent usage
- **Disconnect reasons** - Check `/api/history`

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `400 Bad Request` | Malformed proxy | Check `user:pass@host:port` format |
| `401 Unauthorized` | Invalid token | Verify token or request new one |
| `403 Forbidden` | No quota or limit reached | Check quota, close idle sessions |
| `500 / 503` | Server issue | Retry, contact support if persistent |

---

## Resources

- **Website**: [bots.win](https://bots.win)
- **Examples**: [`examples/`](examples/)
- **Fingerprint Guide**: [`docs/fingerprint.md`](docs/fingerprint.md)
- **CLI Parameters**: [`docs/cli-parameters.md`](docs/cli-parameters.md)
- **DevTools Guide**: [`docs/devtools.md`](docs/devtools.md)
- **API Reference**: [`docs/api-reference.md`](docs/api-reference.md)
- **Legal**: [`DISCLAIMER.md`](DISCLAIMER.md) | [`RESPONSIBLE_USE.md`](RESPONSIBLE_USE.md)
