# DevTools - Remote Browser Debugging

DevTools provides remote access to Chrome DevTools for debugging and inspecting automated workflows. Request a DevTools session to get a URL that opens the full Chrome DevTools interface connected to your cloud browser.

---

## Use Cases

- **Debug automation issues** - Inspect DOM, network requests, console logs in real-time
- **Monitor long-running jobs** - Check progress without interrupting execution
- **Verify page states** - Inspect elements and state at any point during automation
- **Team collaboration** - Share a DevTools URL with teammates for troubleshooting
- **Performance profiling** - Use DevTools Performance tab to analyze scripts

---

## How It Works

1. **Create a CDP Session** during your automation workflow
2. **Listen for completion** by registering a `devtoolsComplete` event handler
3. **Request DevTools access** with optional timeout (defaults to 5 minutes, max 30 minutes)
4. **Share the URL** with a user (log it, send via notification, display in UI)
5. **User opens DevTools** by navigating to the URL in any browser
6. **Session ends** when timeout expires or browser session closes
7. **Script continues** after the `devtoolsComplete` event fires

---

## CDP Commands

BotCloud extends the Chrome DevTools Protocol with these commands:

### `devtools` - Request a DevTools debugging session

```javascript
const { devtoolsURL } = await cdpSession.send('devtools', {
  timeout: 120000  // Optional: milliseconds before auto-timeout (default: 300000, max: 1800000)
});
// Returns: { devtoolsURL: "https://cloud.bots.win/devtools/abc123def456/" }
```

### `devtoolsComplete` - Event fired when session ends

```javascript
cdpSession.on('devtoolsComplete', () => {
  console.log('DevTools session ended');
  // Continue automation...
});
```

---

## Session Management

DevTools sessions are automatically managed:

- **One session per page** - Each page can have one active DevTools session
- **Auto-cleanup** - Sessions end when the page closes or browser disconnects
- **Timeout-based** - Sessions automatically expire after the specified timeout
- **Resource efficient** - Sessions are cleaned up immediately when no longer needed

---

## Code Examples

### Puppeteer

```javascript
import puppeteer from "puppeteer-core";

const browser = await puppeteer.connect({ browserWSEndpoint: wsUrl });
const page = await browser.newPage();
await page.goto("https://example.com/login");

// Create CDP session
const cdp = await page.createCDPSession();

// Listen for completion
cdp.on("devtoolsComplete", () => {
  console.log("DevTools session ended");
});

// Request DevTools (2 minute timeout)
const { devtoolsURL } = await cdp.send("devtools", { timeout: 120000 });
console.log(`Open DevTools: ${devtoolsURL}`);

// Wait for session to complete
await new Promise(resolve => cdp.on("devtoolsComplete", resolve));

// Continue automation after debugging
await page.goto("https://example.com/dashboard");
await browser.close();
```

### Playwright

```javascript
import { chromium } from "playwright";

const browser = await chromium.connectOverCDP(wsUrl);
const context = browser.contexts()[0];
const page = await context.newPage();
await page.goto("https://example.com/login");

// Create CDP session
const cdp = await context.newCDPSession(page);

// Listen for completion
cdp.on("devtoolsComplete", () => {
  console.log("DevTools session ended");
});

// Request DevTools (2 minute timeout)
const { devtoolsURL } = await cdp.send("devtools", { timeout: 120000 });
console.log(`Open DevTools: ${devtoolsURL}`);

// Wait for session to complete
await new Promise(resolve => cdp.on("devtoolsComplete", resolve));

// Continue automation after debugging
await page.goto("https://example.com/dashboard");
await browser.close();
```

### With Async/Await Helper

```javascript
function waitForDevToolsComplete(cdp) {
  return new Promise((resolve) => {
    cdp.once("devtoolsComplete", resolve);
  });
}

// Usage
const { devtoolsURL } = await cdp.send("devtools", { timeout: 300000 });
console.log(`DevTools URL: ${devtoolsURL}`);

await waitForDevToolsComplete(cdp);
console.log("Continuing automation...");
```

---

## DevTools Features

When a user opens the DevTools URL:

- **Full Chrome DevTools** - Complete DevTools interface (Elements, Console, Network, etc.)
- **Real-time inspection** - Inspect DOM, modify styles, execute JavaScript
- **Network monitoring** - View all network requests and responses
- **Console access** - View logs and execute commands
- **Performance profiling** - Use Performance and Memory tabs

---

## Access & Billing

| Aspect | Details |
|--------|---------|
| **Access** | Requires DevTools access enabled on your account |
| **Billing Premium** | +0.35x multiplier when DevTools is enabled |
| **Timeout** | Default 5 minutes, maximum 30 minutes |

**Note:** DevTools access is an account-level permission. Contact your service provider to enable this feature if needed.

---

## Important Notes

| Aspect | Details |
|--------|---------|
| **Limit** | One DevTools session per page |
| **Security** | Tokens are single-use and expire after timeout |
| **Interface** | Full Chrome DevTools functionality |
| **Quota** | DevTools time counts toward usage quota (with +0.35x premium) |
| **Timeout** | `devtoolsComplete` fires when session ends |

---

## Error Handling

```javascript
try {
  const { devtoolsURL } = await cdp.send("devtools", { timeout: 120000 });
  console.log(`DevTools: ${devtoolsURL}`);

  // Set up timeout fallback
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("DevTools timeout")), 130000)
  );

  await Promise.race([
    waitForDevToolsComplete(cdp),
    timeoutPromise
  ]);
} catch (error) {
  console.error("DevTools error:", error.message);
  // Handle gracefully - maybe continue automation anyway
}
```

---

## Working Examples

See the complete working examples in:
- [`examples/devtools/node/puppeteer-devtools.mjs`](../examples/devtools/node/puppeteer-devtools.mjs)
- [`examples/devtools/node/playwright-devtools.mjs`](../examples/devtools/node/playwright-devtools.mjs)

---

[← Back to README](../README.md)
