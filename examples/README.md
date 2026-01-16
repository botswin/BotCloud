# BotCloud Code Examples

This directory contains ready-to-run code examples for connecting to BotCloud using various automation frameworks and programming languages for authorized automation and fingerprint research.

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

| Framework | Node.js | Python | C# | Go | Java | Ruby |
|-----------|---------|--------|-----|-----|------|------|
| **Puppeteer** | [✅](puppeteer/node/) | - | [✅](puppeteer/csharp/) | - | - | - |
| **Playwright** | [✅](playwright/node/) | [✅](playwright/python/) | [✅](playwright/csharp/) | - | - | - |
| **CLI Config** | [✅](cli/node/) | - | - | - | - | - |
| **CDP (Native)** | - | - | - | [✅](cdp/go/) | [✅](cdp/java/) | [✅](cdp/ruby/) |

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
- You prefer a modern, well-maintained API

#### CLI Configuration - Custom Fingerprint Settings

BotCloud supports 50+ CLI parameters for runtime fingerprint configuration. By default, BotCloud auto-detects timezone/locale from your proxy IP. Use CLI parameters when you need specific overrides.

| Language | Path | Description |
|----------|------|-------------|
| **Node.js** | [`cli/node/custom-config.mjs`](cli/node/custom-config.mjs) | Custom fingerprint configuration with noise injection |

**When to use CLI Configuration:**
- You need specific timezone/locale instead of auto-detection
- You want to enable/disable noise injection for canvas, WebGL, or audio
- You need to customize browser brand or version
- You're debugging fingerprint-related issues

**Key parameters:**
- `--bot-config-timezone`: Override timezone (e.g., `America/New_York`)
- `--bot-config-locale`: Override browser locale (e.g., `en-US`)
- `--bot-config-languages`: Override language preferences (e.g., `en,es`)
- `--bot-config-noise-canvas`: Enable canvas fingerprint noise
- `--bot-config-noise-webgl-image`: Enable WebGL image noise
- `--bot-config-noise-audio-context`: Enable audio context noise
- `--bot-disable-debugger`: Ignore debugger statements

See the [Connection Parameters](../README.md#connection-parameters) section in the main README for the complete list.

#### DevTools - Remote Browser Debugging

DevTools provides remote access to Chrome DevTools for debugging and inspecting automated workflows. Request a DevTools session to get a URL that opens the full Chrome DevTools interface.

| Language | Path | Description |
|----------|------|-------------|
| **Node.js (Puppeteer)** | [`devtools/node/puppeteer-devtools.mjs`](devtools/node/puppeteer-devtools.mjs) | Remote debugging session using Puppeteer |
| **Node.js (Playwright)** | [`devtools/node/playwright-devtools.mjs`](devtools/node/playwright-devtools.mjs) | Remote debugging session using Playwright |

**When to use DevTools:**
- **Debug automation issues** - Inspect DOM, network, console in real-time
- **Monitor long-running jobs** - Check progress without interrupting execution
- **Verify page states** - Inspect elements and state at any point
- **Team collaboration** - Share a DevTools URL with teammates for troubleshooting
- **Performance profiling** - Use DevTools Performance tab to analyze scripts

**Key features:**
- Full Chrome DevTools interface (Elements, Console, Network, etc.)
- Real-time inspection and modification
- Configurable timeout (defaults to 5 minutes, max 30 minutes)
- `devtoolsComplete` event signals when session ends
- Works with both Puppeteer and Playwright via CDP sessions
- DevTools tokens are single-use and expire after timeout

#### CDP Multi-Language - Go, Java, Ruby

BotCloud supports direct CDP connections from any language with WebSocket support. These examples demonstrate native CDP connections without framework dependencies.

| Language | Library | Path | Description |
|----------|---------|------|-------------|
| **Go** | chromedp | [`cdp/go/chromedp-quickstart.go`](cdp/go/chromedp-quickstart.go) | Recommended Go library, fully compatible |
| **Go** | rod | [`cdp/go/rod-quickstart.go`](cdp/go/rod-quickstart.go) | Low-level CDP with proper WebSocket key |
| **Java** | Native WebSocket | [`cdp/java/CdpQuickstart.java`](cdp/java/CdpQuickstart.java) | Java 11+ native WebSocket API |
| **Ruby** | Ferrum | [`cdp/ruby/ferrum-quickstart.rb`](cdp/ruby/ferrum-quickstart.rb) | High-level Ruby automation library |

**When to use CDP multi-language examples:**
- You're working in Go, Java, or Ruby and want direct BotCloud access
- You need fine-grained CDP control without high-level framework overhead
- You're building custom automation tools in your preferred language

**Library compatibility notes:**

| Language | Library | Compatibility | Notes |
|----------|---------|---------------|-------|
| Go | chromedp | ✅ Full | Recommended for Go users |
| Go | rod (high-level) | ❌ Incompatible | Uses invalid WebSocket key `"nil"` |
| Go | rod (low-level) | ✅ With workaround | Requires custom `Sec-WebSocket-Key` header |
| Java | Native WebSocket | ✅ Full | Java 11+ required |
| Java | cdp4j | ❌ Not suitable | Designed for local Chrome only |
| Ruby | Ferrum (ws_url) | ✅ Full | Must use `ws_url` parameter |
| Ruby | Ferrum (url) | ❌ Incompatible | `URI.join()` strips query params |

**rod WebSocket key issue:**

rod's default WebSocket implementation sends `"nil"` as `Sec-WebSocket-Key`, which violates RFC 6455. The workaround is to use rod's low-level CDP API with a proper key:

```go
func generateWebSocketKey() string {
    key := make([]byte, 16)
    rand.Read(key)
    return base64.StdEncoding.EncodeToString(key)
}

ws := &cdp.WebSocket{}
ws.Connect(ctx, wsURL, http.Header{
    "Sec-WebSocket-Key": {generateWebSocketKey()},
})
```

**Ferrum URL parameter issue:**

Ferrum's `url` parameter calls `/json/version` via `URI.join()`, which loses query parameters. Always use `ws_url`:

```ruby
# Correct
browser = Ferrum::Browser.new(ws_url: "wss://cloud.bots.win?token=xxx")

# Incorrect - token will be lost
browser = Ferrum::Browser.new(url: "https://cloud.bots.win?token=xxx")
```

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

# DevTools - Remote Debugging
node examples/devtools/node/puppeteer-devtools.mjs   # Puppeteer version
node examples/devtools/node/playwright-devtools.mjs  # Playwright version

# CLI Configuration - Custom Fingerprint Settings
node examples/cli/node/custom-config.mjs
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
```

### Go Examples

```bash
cd examples/cdp/go

# Install dependencies
go mod tidy

# chromedp (recommended)
go run chromedp-quickstart.go

# rod (low-level API with WebSocket key workaround)
go run rod-quickstart.go
```

### Java Examples

```bash
cd examples/cdp/java

# Compile (Java 11+ required)
javac CdpQuickstart.java

# Run
java CdpQuickstart
```

### Ruby Examples

```bash
cd examples/cdp/ruby

# Install dependencies
bundle install

# Run with Bundler
bundle exec ruby ferrum-quickstart.rb

# Or install gem globally
gem install ferrum
ruby ferrum-quickstart.rb
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
npm install dotenv puppeteer-core playwright ws
```

**Python:**
```bash
pip install python-dotenv pyppeteer playwright websockets
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
npm install puppeteer-core playwright ws
```

### Python

Install all Python dependencies:

```bash
pip install -r requirements.txt
```

Or selectively:

```bash
pip install pyppeteer playwright websockets
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
- Additional Go libraries (e.g., other CDP clients)
- Java Playwright integration
- Additional Ruby libraries (e.g., Cuprite)
- Additional scenarios (form filling, data scraping, multi-page workflows)

---

## Support

- **Documentation Issues:** Open an issue in this repository
- **Technical Support:** Contact your service provider
