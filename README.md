<h1 align="center">☁️ BotCloud</h1>

<h4 align="center">Hosted Privacy Browser Gateway for teams validating fingerprint defenses without babysitting desktops</h4>

<p align="center">
  Usage-based billing • Works with your favorite automation stacks • Proxy-aware by design
</p>

---

BotCloud keeps a fleet of browsers online so you do not have to. Point your existing Puppeteer, Playwright, Selenium, or PuppeteerSharp scripts at our WebSocket endpoint and the sessions wake up in the cloud with the automation APIs you already know. This repo acts as the field manual: it walks through connection requirements, hands you drop-in samples in several languages, and collects the operational notes we bundle with privacy-focused deployments.

**Why privacy teams pick BotCloud:**

- No more desktop babysitting because cloud browsers stay patched and geo-distributed out of the box.
- Existing scripts keep working (Puppeteer, Playwright, Selenium, CDP) with minimal tweaks for privacy testing.
- Mandatory proxy plus region controls with usage-based billing make compliance reviews easy.

Skim the highlights, then dive into the sections that match your workflow.

> 💡 **Pricing heads-up:** Billing is usage-based. Unit costs are still being finalized, so reach out to the business contact on your contract for the latest numbers.
> ⚖️ Review the [Legal Disclaimer](DISCLAIMER.md) and [Responsible Use Guidelines](RESPONSIBLE_USE.md) before onboarding any workload.

**🌐 Learn more:** Visit our official website at **[bots.win](https://bots.win)** for detailed documentation, pricing, and support.

## Quick Start

To get a session going you only need a token, a proxy, and a short snippet of code.

1. **Ask for access.** Contact your service provider for a dedicated `token` and keep it secret.
2. **Prepare a proxy.** BotCloud refuses connections without `--proxy-server=username:password@host:port`.
3. **Build the endpoint.** Drop token, proxy, and optional `device_type` into a query string and attach it to `wss://cloud.bots.win`.
4. **Connect using your preferred stack.** `puppeteer.connect`, `chromium.connectOverCDP`, Selenium BiDi, or the pure CDP sample all work the same way.
5. **Shut down politely.** Call `browser.close()` once the job is done so quota frees up for the next run.

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

---

## Cloud Service Highlights

- Managed browser fleets stay patched and geo-distributed, removing the need to run fragile lab hardware.
- Automation compatibility spans Puppeteer, Playwright, Selenium BiDi, and direct CDP traffic, so legacy scripts keep working.
- Proxy-aware routing enforces explicit `--proxy-server` declarations for predictable geo testing and compliance tracking.
- Usage-based billing lets you burst during campaigns and scale down later without pre-purchasing seats.
- Built-in quotas, detailed logs, and abuse workflows keep the shared infrastructure safe for every tenant.
- LiveURL interactive sessions let scripts pause for human input, which is perfect for CAPTCHAs, 2FA, or manual login steps.

---

## Token Provisioning

Tokens are provided by your service provider. They might look like `user-token-abc123` or a long 64-character hex string. Create separate tokens for dev, staging, and production so you can audit usage later. Keep them in a vault or CI secret manager and never in git. If one ever leaks, contact your service provider to rotate it before running anything else.

> 🔐 Keep a simple spreadsheet or secrets inventory that lists where each token is used and when it expires. Future-you will be grateful.

---

## Connection Parameters

| Parameter        | Required | Example                                     | Notes |
|------------------|----------|---------------------------------------------|-------|
| `token`          | ✅        | `user-token-abc123`                         | Identifies you for auth and billing |
| `--proxy-server` | ✅        | `username:password@proxy.example.com:4600`  | Must include credentials and host:port |
| `device_type`    | ❌        | `mac` / `win` / `android`                   | Optional fingerprint override (defaults to `mac`) |
| `user_data_id`   | ❌        | `udd_xxxxxxxxxxxx`                          | Optional User Data ID for persistent browser data (cookies, localStorage, login states) |

Keep a few basics in mind: include every parameter in the WebSocket query (`wss://cloud.bots.win?${query}`), URL-encode usernames or passwords that contain reserved characters such as `@` or `:`, and verify token plus proxy values before dialing so you do not burn quota on `400` or `401` responses.

---

## Network & Security

Treat BotCloud like any other production dependency. Keep outbound traffic to `cloud.bots.win:443` open and point it at proxies with enough bandwidth in the region you care about. If your proxy vendor insists on whitelists, add the BotCloud IP range before you kick off the first job. Instrument your scripts with `browser.on('disconnected')` (or the equivalent) so you hear about flaky links right away. Tokens and proxy strings should always come from environment variables or your secret store. Need special handling such as custom WebRTC routes, DNS tweaks, or TLS pinning? File a ticket through the enterprise channel and we will sort it out together.

---

## Integration Examples

BotCloud ships with ready-to-run samples. Each framework has its own corner of the repo so you can jump straight to the stack you know (Node.js under `examples/<framework>/node/`, TypeScript under `examples/<framework>/typescript/`, Python under `examples/<framework>/python/`, C# under `examples/<framework>/csharp/`, and CDP-only helpers in `examples/cdp/`).

Open any example file, modify the `CONFIG` section at the top with your token and proxy, then install the prerequisites once:

- `cd examples && npm install`
- `pip install -r examples/requirements.txt` (run `playwright install chromium` after the first install)
- `dotnet restore` inside each C# sample folder before `dotnet run`

For a complete list of all available examples and instructions, see [`examples/README.md`](examples/README.md).

| Framework | Language | Example File | Description |
|-----------|----------|--------------|-------------|
| **Puppeteer** | Node.js  | [`examples/puppeteer/node/quickstart.mjs`](examples/puppeteer/node/quickstart.mjs) | Simple `puppeteer.connect` flow with screenshot |
| **Puppeteer** | C#       | [`examples/puppeteer/csharp/PuppeteerConnect.cs`](examples/puppeteer/csharp/PuppeteerConnect.cs) | PuppeteerSharp connection |
| **Playwright** | Node.js  | [`examples/playwright/node/quickstart.mjs`](examples/playwright/node/quickstart.mjs) | Playwright CDP with context reuse |
| **Playwright** | Python   | [`examples/playwright/python/quickstart.py`](examples/playwright/python/quickstart.py) | Async Playwright connection |
| **Playwright** | C#       | [`examples/playwright/csharp/PlaywrightConnect.cs`](examples/playwright/csharp/PlaywrightConnect.cs) | Playwright for .NET |
| **Selenium** | Python   | [`examples/selenium/python/quickstart.py`](examples/selenium/python/quickstart.py) | Selenium with CDP |
| **Selenium** | C#       | [`examples/selenium/csharp/SeleniumBidi.cs`](examples/selenium/csharp/SeleniumBidi.cs) | Selenium BiDi |
| **LiveURL** | Node.js (Puppeteer) | [`examples/liveurl/node/puppeteer-liveurl.mjs`](examples/liveurl/node/puppeteer-liveurl.mjs) | Interactive session with human input (Puppeteer) |
| **LiveURL** | Node.js (Playwright) | [`examples/liveurl/node/playwright-liveurl.mjs`](examples/liveurl/node/playwright-liveurl.mjs) | Interactive session with human input (Playwright) |

Need another SDK? Tell us via issues or your usual internal contact and we will add new samples once the framework is validated.

---

## LiveURL - Interactive Browser Control

LiveURL enables real-time human intervention during automated workflows. When your script encounters a CAPTCHA, requires two-factor authentication, or needs manual input, it can request a LiveURL that displays the live browser session in any web browser. The user sees real-time screen updates, can interact with the page (click, type, scroll), and signals completion by clicking "Done," at which point your automation continues.

### When to Use LiveURL

- **CAPTCHA Handling** - Let humans solve CAPTCHAs while your script waits
- **Two-Factor Authentication** - Manually enter 2FA codes or approve push notifications
- **Manual Login** - Handle complex login flows that resist automation
- **Debugging** - Visually inspect automation state and interact with the page
- **Hybrid Workflows** - Combine automated steps with human decision points

### How It Works

1. **Create a CDP Session** during your automation workflow
2. **Listen for completion** by registering a `liveComplete` event handler
3. **Request a LiveURL** with optional timeout (defaults to 5 minutes)
4. **Share the URL** with a user (log it, send via notification, display in UI)
5. **User interacts** by opening the URL in any browser so they see live screen updates and can click/type/scroll
6. **User signals done** by clicking the "Done" button or waiting for timeout
7. **Script continues** after the `liveComplete` event fires

### CDP Commands

BotCloud extends the Chrome DevTools Protocol with these commands:

**`liveURL`** - Request an interactive viewing session

```javascript
const { liveURL } = await cdpSession.send('liveURL', {
  timeout: 120000  // Optional: milliseconds before auto-timeout (default: 300000)
});
// Returns: { liveURL: "https://cloud.bots.win/live/abc123def456" }
```

**`liveComplete`** - Event fired when user clicks "Done" or timeout expires

```javascript
cdpSession.on('liveComplete', () => {
  console.log('User finished interaction');
  // Continue automation...
});
```

### Code Examples

#### Puppeteer

```javascript
import puppeteer from "puppeteer-core";

const browser = await puppeteer.connect({ browserWSEndpoint: wsUrl });
const page = await browser.newPage();
await page.goto("https://example.com/login");

// Create CDP session
const cdp = await page.createCDPSession();

// Listen for completion
cdp.on("liveComplete", () => {
  console.log("User completed interaction");
});

// Request LiveURL (2 minute timeout)
const { liveURL } = await cdp.send("liveURL", { timeout: 120000 });
console.log(`Open this URL to interact: ${liveURL}`);

// Wait for user to complete
await new Promise(resolve => cdp.on("liveComplete", resolve));

// Continue automation after user interaction
await page.goto("https://example.com/dashboard");
await browser.close();
```

#### Playwright

```javascript
import { chromium } from "playwright";

const browser = await chromium.connectOverCDP(wsUrl);
const context = browser.contexts()[0];
const page = await context.newPage();
await page.goto("https://example.com/login");

// Create CDP session
const cdp = await context.newCDPSession(page);

// Listen for completion
cdp.on("liveComplete", () => {
  console.log("User completed interaction");
});

// Request LiveURL (2 minute timeout)
const { liveURL } = await cdp.send("liveURL", { timeout: 120000 });
console.log(`Open this URL to interact: ${liveURL}`);

// Wait for user to complete
await new Promise(resolve => cdp.on("liveComplete", resolve));

// Continue automation after user interaction
await page.goto("https://example.com/dashboard");
await browser.close();
```

### Important Notes

- **One LiveURL per session** - Only one active LiveURL allowed per browser session
- **Security** - LiveURL tokens are single-use and expire after timeout or completion
- **Screen updates** - Live view shows real-time browser screen (approximately 5-10 FPS)
- **Full interaction** - Users can click, type, scroll, and navigate just like a local browser
- **Quota consumption** - LiveURL time counts toward your usage quota
- **Timeout handling** - `liveComplete` fires on both user completion and timeout expiration

For complete working examples, see [`examples/liveurl/`](examples/liveurl/).

---

## API Reference

All REST API endpoints are hosted at `https://cloud.bots.win/api` and require Bearer token authentication:

```bash
Authorization: Bearer your-user-token-here
```

### GET /api/quota

Check remaining quota before launching jobs.

```bash
curl -H "Authorization: Bearer your-token" https://cloud.bots.win/api/quota
```

**Response:**
```json
{
  "totalQuota": 10000,
  "usedQuota": 2350,
  "remainingQuota": 7650,
  "percentUsed": 23.5
}
```

### GET /api/usage

Get usage statistics for reporting and cost analysis.

```bash
curl -H "Authorization: Bearer your-token" https://cloud.bots.win/api/usage
```

**Response:**
```json
{
  "totalSessions": 142,
  "totalMinutes": 2350,
  "activeSessions": 1
}
```

### GET /api/history

Retrieve session history for audit trails. Supports optional `start` and `end` query parameters (ISO 8601 timestamps).

```bash
curl -H "Authorization: Bearer your-token" https://cloud.bots.win/api/history
```

**Response:**
```json
{
  "sessions": [
    {
      "id": 1,
      "startedAt": "2025-01-15T10:30:00Z",
      "endedAt": "2025-01-15T10:33:25Z",
      "durationMinutes": 3,
      "quotaConsumed": 3,
      "disconnectReason": "client_closed"
    }
  ],
  "total": 1
}
```

**Disconnect Reasons:**
- `client_closed` - Client called `browser.close()`
- `client_disconnected` - WebSocket connection closed unexpectedly
- `server_closed` - Browser server closed the connection
- `insufficient_balance` - Quota exhausted during session
- `socket_timeout` - No data transferred for 5 minutes
- `tcp_error` - Network error

### POST /api/user-data

Create a new User Data for persistent browser storage (cookies, localStorage, login states). Each User Data directory persists across sessions until explicitly deleted.

```bash
curl -X POST \
  -H "Authorization: Bearer your-token" \
  https://cloud.bots.win/api/user-data
```

**Response:**
```json
{
  "id": "udd_abc123def456xyz0",
  "createdAt": "2025-01-15T10:30:00Z"
}
```

**Error Codes:**
- `403 NO_PERMISSION` - User does not have permission to create User Data
- `429 QUOTA_EXCEEDED` - User Data quota limit reached

### GET /api/user-data

List all User Data entries owned by the authenticated user, including quota information.

```bash
curl -H "Authorization: Bearer your-token" \
  https://cloud.bots.win/api/user-data
```

**Response:**
```json
{
  "items": [
    {
      "id": "udd_abc123def456xyz0",
      "createdAt": "2025-01-15T10:30:00Z",
      "lastUsedAt": "2025-01-16T08:00:00Z",
      "isLocked": false
    }
  ],
  "total": 1,
  "quota": {
    "used": 1,
    "max": 5,
    "canCreate": true
  }
}
```

**Field Descriptions:**
- `isLocked` - True when User Data is currently in use by an active session
- `quota.used` - Number of User Data entries created
- `quota.max` - Maximum allowed User Data entries
- `quota.canCreate` - Whether user can create more User Data

### DELETE /api/user-data/:id

Delete a User Data entry and its associated browser data. User Data cannot be deleted while in use.

```bash
curl -X DELETE \
  -H "Authorization: Bearer your-token" \
  https://cloud.bots.win/api/user-data/udd_abc123def456xyz0
```

**Response:**
```json
{
  "success": true
}
```

**Error Codes:**
- `404` - User Data not found
- `403` - Access denied (not owned by user)
- `409` - User Data is currently in use (locked)

### Using User Data

To use persistent browser data, create a User Data ID first, then pass it as a connection parameter:

```javascript
// 1. Create User Data
const response = await fetch('https://cloud.bots.win/api/user-data', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
const { id: userDataId } = await response.json();

// 2. Connect with User Data
const params = new URLSearchParams({
  token: 'your-token',
  '--proxy-server': 'username:password@proxy.example.com:4600',
  user_data_id: userDataId  // Browser will use persistent data directory
});

const browser = await puppeteer.connect({
  browserWSEndpoint: `wss://cloud.bots.win?${params.toString()}`
});

// Cookies, localStorage, and login states persist across sessions
```

See [`examples/user-data/`](examples/user-data/) for complete working examples.

### Billing

BotCloud uses usage-based billing: **1 minute of browser session time = 1 quota unit**. Pricing is still being finalized, so contact your service provider for the latest unit costs.

---

## Operations

### Connection Limits

BotCloud enforces **one active connection per token**. Attempting a second connection returns `403 Forbidden: User already has an active connection`.

**To run parallel sessions:**
1. Request multiple tokens from your service provider (each supports 1 concurrent session)
2. Use a job queue to serialize tasks per token
3. Maintain a token pool and distribute jobs across them

### Monitoring

Pipe these metrics into your observability stack:
- **Remaining quota** - Alert when dropping below 10 units
- **Active sessions** - Track concurrent usage
- **Error rate** - Monitor `403` and `500` responses
- **Disconnect reasons** - Identify patterns via `/api/history`

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

---

## Troubleshooting

| What you see | Usually means | Try this |
|--------------|---------------|----------|
| `400 Bad Request` | Missing or malformed `--proxy-server` | Double-check proxy syntax and URL-encode special characters |
| `401 Unauthorized` | Token is wrong or expired | Verify the token value or contact your service provider to reissue it |
| `403 Forbidden` | No remaining credits or one connection per token limit | Query your quota, close idle sessions, or use multiple tokens |
| `500` or `503` | Gateway hiccup | Retry and share the failing request ID with support |
| Random disconnects | Proxy instability or network jitter | Add reconnection logic and monitor proxy health |

Wrap your automation in `try/finally` so `browser.close()` always fires, even when errors bubble up.

---

## Best Practices

- Validate token and proxy values before dialing the Gateway.
- Add exponential-backoff reconnects for workflows that run longer than a minute or two.
- Keep tokens in a secret store and include secret-scanning in CI pipelines.
- Ship quota metrics into your observability stack and alert before the balance hits zero.
- Wrap endpoint construction in a helper so each script stays consistent.

---

## Resources

- **Official Website**: [https://bots.win](https://bots.win)
- Legal Disclaimer: [`DISCLAIMER.md`](DISCLAIMER.md)
- Responsible Use Guidelines: [`RESPONSIBLE_USE.md`](RESPONSIBLE_USE.md)
- Changelog: [`CHANGELOG.md`](CHANGELOG.md)
- Sample Scripts: [`examples/`](examples/)
- Support: Contact your service provider with token and error details

Contributions are welcome. Open an issue or share feature requests through internal channels so we can keep this repository aligned with real-world integration needs.
