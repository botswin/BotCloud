# BotCloud Code Examples

This directory contains ready-to-run code examples for connecting to BotCloud using various automation frameworks and programming languages for authorized privacy and fingerprint research.

## Quick Start

### 1. Configure Credentials

Open any example file and modify the `CONFIG` section at the top:

```javascript
// For JavaScript/TypeScript examples
const CONFIG = {
  token: "your-token-here",
  proxy: "username:password@proxy.example.com:4600",
  deviceType: "mac"
};
```

```python
# For Python examples
CONFIG = {
    "token": "your-token-here",
    "proxy": "username:password@proxy.example.com:4600",
    "device_type": "mac"
}
```

### 2. Install Dependencies

Choose your language/framework and install dependencies:

**Node.js/TypeScript:**
```bash
npm install
```

**Python:**
```bash
pip install -r requirements.txt
# For Playwright, also install browser
playwright install chromium
```

**C#:**
```bash
cd examples/<framework>/csharp
dotnet restore
```

### 3. Run an Example

Pick an example from the table below and run it:

```bash
# Node.js
node examples/puppeteer/node/cloud-connect.mjs

# Python
python examples/playwright/python/cloud_connect.py

# TypeScript
npx ts-node examples/puppeteer/typescript/cloud-connect.ts

# C#
cd examples/playwright/csharp && dotnet run
```

---

## Available Examples

### Framework × Language Matrix

| Framework | Node.js | Python | C# |
|-----------|---------|--------|-----|
| **Puppeteer** | [✅](puppeteer/node/) | - | [✅](puppeteer/csharp/) |
| **Playwright** | [✅](playwright/node/) | [✅](playwright/python/) | [✅](playwright/csharp/) |
| **Selenium** | - | [✅](selenium/python/) | [✅](selenium/csharp/) |

### Example Details

#### User Data Management

User Data allows you to persist browser state (cookies, localStorage, login sessions) across multiple browser sessions.

| Language | Path | Description |
|----------|------|-------------|
| **Node.js** | [`user-data/node/user-data.mjs`](user-data/node/user-data.mjs) | Complete User Data lifecycle: create, use, verify persistence, delete |
| **Python** | [`user-data/python/user_data.py`](user-data/python/user_data.py) | User Data management with Playwright and async/await |

**When to use User Data:**
- You need to preserve login states across sessions
- You want to avoid repeated authentication flows
- You're running multi-step workflows that span multiple sessions
- You need persistent cookies or localStorage data

**Key features:**
- Each User Data has a unique ID (format: `udd_xxxxxxxxxxxx`)
- Data persists until explicitly deleted via API
- Cannot delete User Data while it's locked (in use by active session)
- Quota limits apply (check `/api/user-data` for current limits)

#### Puppeteer

Puppeteer is a high-level Node.js library for controlling Chrome/Chromium via the DevTools Protocol.

| Language | Path | Description |
|----------|------|-------------|
| **Node.js** | [`puppeteer/node/quickstart.mjs`](puppeteer/node/quickstart.mjs) | Simple Puppeteer connection with screenshot |
| **C#** | [`puppeteer/csharp/PuppeteerConnect.cs`](puppeteer/csharp/PuppeteerConnect.cs) | PuppeteerSharp connection example |

**When to use Puppeteer:**
- You need Chrome/Chromium-specific features
- You're already using Puppeteer locally
- You prefer a simpler, focused API

#### Playwright

Playwright is a cross-browser automation library supporting Chromium, Firefox, and WebKit.

| Language | Path | Description |
|----------|------|-------------|
| **Node.js** | [`playwright/node/quickstart.mjs`](playwright/node/quickstart.mjs) | Playwright CDP connection with context reuse |
| **Python** | [`playwright/python/quickstart.py`](playwright/python/quickstart.py) | Async Playwright connection |
| **C#** | [`playwright/csharp/PlaywrightConnect.cs`](playwright/csharp/PlaywrightConnect.cs) | Playwright for .NET |

**When to use Playwright:**
- You need cross-browser support
- You want built-in waiting and auto-retry features
- You're migrating from Selenium

#### Selenium

Selenium is the classic WebDriver standard for browser automation.

| Language | Path | Description |
|----------|------|-------------|
| **Python** | [`selenium/python/quickstart.py`](selenium/python/quickstart.py) | Selenium with CDP connection |
| **C#** | [`selenium/csharp/SeleniumBidi.cs`](selenium/csharp/SeleniumBidi.cs) | Selenium BiDi example |

**When to use Selenium:**
- You have existing Selenium test suites
- You need WebDriver compatibility
- You're integrating with Selenium Grid

#### LiveURL - Interactive Browser Control

LiveURL enables real-time human intervention during automated workflows. When your script needs manual input, it requests a LiveURL that displays the live browser session in any web browser with real-time screen updates and full interaction capabilities.

| Language | Path | Description |
|----------|------|-------------|
| **Node.js (Puppeteer)** | [`liveurl/node/puppeteer-liveurl.mjs`](liveurl/node/puppeteer-liveurl.mjs) | Interactive session with LiveURL using Puppeteer |
| **Node.js (Playwright)** | [`liveurl/node/playwright-liveurl.mjs`](liveurl/node/playwright-liveurl.mjs) | Interactive session with LiveURL using Playwright |

**When to use LiveURL:**
- You need to solve CAPTCHAs during privacy automation
- Manual two-factor authentication is required
- Complex login flows resist automation
- Debugging automation scripts visually
- Hybrid workflows combining automation with human decision points

**Key features:**
- Real-time screen updates (approximately 5-10 FPS)
- Full interaction: click, type, scroll, navigate
- Configurable timeout (defaults to 5 minutes)
- `liveComplete` event signals when user clicks "Done" or timeout expires
- Works with both Puppeteer and Playwright via CDP sessions
- LiveURL tokens are single-use and expire after completion

---

## Running Examples

### Node.js Examples

```bash
# User Data Management
node examples/user-data/node/user-data.mjs

# Puppeteer
node examples/puppeteer/node/quickstart.mjs

# Playwright
node examples/playwright/node/quickstart.mjs

# LiveURL - Interactive Sessions
node examples/liveurl/node/puppeteer-liveurl.mjs   # Puppeteer version
node examples/liveurl/node/playwright-liveurl.mjs  # Playwright version
```

### TypeScript Examples

```bash
# Using ts-node (recommended for quick testing)
npx ts-node examples/puppeteer/typescript/cloud-connect.ts
npx ts-node examples/playwright/typescript/cloud-connect.ts

# Or compile first
cd examples/puppeteer/typescript
tsc
node dist/cloud-connect.js
```

### Python Examples

```bash
# User Data Management
python examples/user-data/python/user_data.py

# Puppeteer (pyppeteer)
python examples/puppeteer/python/cloud_connect.py

# Playwright
python examples/playwright/python/cloud_connect.py

# Selenium
python examples/selenium/python/cloud_connect.py

# CDP
python examples/cdp/python/cdp_connect.py
```

### C# Examples

```bash
# Puppeteer
cd examples/puppeteer/csharp
dotnet restore
dotnet run

# Playwright
cd examples/playwright/csharp
dotnet restore
dotnet run

# Selenium
cd examples/selenium/csharp
dotnet restore
dotnet run
```

---

## Common Patterns

### Configuration

All examples use the same CONFIG pattern at the top of each file:

```javascript
const CONFIG = {
  token: "your-token",
  proxy: "user:pass@proxy.example.com:4600",
  deviceType: "mac"  // or "win", "android"
};
```

### Connection

All examples follow this pattern:

1. Build WebSocket endpoint URL with query parameters
2. Connect using framework's remote connection API
3. Perform automation tasks
4. Close browser in `finally` block to release quota

### Error Handling

Always wrap automation in try/finally:

```javascript
let browser;
try {
  browser = await connect({ browserWSEndpoint: url });
  // automation code
} finally {
  if (browser) await browser.close();
}
```

```python
browser = None
try:
    browser = await connect(browserWSEndpoint=url)
    # automation code
finally:
    if browser:
        await browser.close()
```

---

## Troubleshooting

### "Missing or invalid '--proxy-server' parameter"

Ensure proxy is in format `username:password@host:port`. URL-encode special characters:

```javascript
const user = encodeURIComponent('user@example');
const pass = encodeURIComponent('p@ss');
```

### "Invalid or missing token"

1. Check CONFIG section in your script has the correct token
2. Verify token with: `curl -H "Authorization: Bearer $TOKEN" https://cloud.bots.win/api/quota`
3. Request new token from your service provider if expired

### "Insufficient balance"

Check quota before running:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://cloud.bots.win/api/quota
```

Request quota top-up from your service provider.

### "User already has an active connection"

BotCloud allows one connection per token. Options:

1. Close existing connection (call `browser.close()`)
2. Wait 5 minutes for idle timeout
3. Use a different token

### Import/Module Errors

**Node.js:**
```bash
npm install dotenv puppeteer-core playwright selenium-webdriver ws
```

**Python:**
```bash
pip install python-dotenv pyppeteer playwright selenium websockets
playwright install chromium  # For Playwright
```

**TypeScript:**
```bash
npm install -D typescript @types/node ts-node
```

---

## Extending Examples

### Add More Automation

```javascript
// Navigate to multiple pages
await page.goto('https://example.com');
await page.click('a[href="/page2"]');
await page.waitForNavigation();

// Fill forms
await page.type('#username', 'myuser');
await page.type('#password', 'mypass');
await page.click('button[type="submit"]');

// Extract data
const data = await page.$$eval('.item', items =>
  items.map(item => item.textContent)
);
```

### Add Logging

```javascript
import { writeFileSync } from 'fs';

const startTime = Date.now();

browser.on('disconnected', () => {
  const duration = Date.now() - startTime;
  writeFileSync('session-log.json', JSON.stringify({
    duration_ms: duration,
    timestamp: new Date().toISOString()
  }));
});
```

### Add Retries

```javascript
async function connectWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await puppeteer.connect({ browserWSEndpoint: url });
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
    }
  }
}
```

---

## Dependencies

### Node.js

Install all Node.js dependencies:

```bash
npm install
```

Or selectively:

```bash
npm install puppeteer-core playwright selenium-webdriver ws
```

### Python

Install all Python dependencies:

```bash
pip install -r requirements.txt
```

Or selectively:

```bash
pip install pyppeteer playwright selenium websockets
playwright install chromium  # Required for Playwright
```

### C#

Dependencies are specified in `.csproj` files:

```bash
cd examples/<framework>/csharp
dotnet restore
```

---

## Next Steps

- **[Quick Start Guide](../docs/quickstart.md)** - Get up and running in 5 minutes
- **[API Reference](../docs/api-reference.md)** - Complete API documentation
- **[Operations Guide](../docs/operations.md)** - Monitoring, billing, best practices
- **[Main README](../README.md)** - Project overview

---

## Contributing

Found an issue or want to add an example in another language?

1. Open an issue describing the problem or proposed addition
2. Include sample code or error messages
3. Tag with `documentation` or `examples`

We especially welcome examples for:
- Go (using chromedp or rod)
- Java (using Playwright for Java or Selenium)
- Ruby (using Ferrum or Selenium)
- Additional scenarios (form filling, data scraping, etc.)

---

## Support

- **Documentation Issues:** Open an issue in this repository
- **Technical Support:** Contact your service provider
