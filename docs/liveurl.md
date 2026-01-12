# LiveURL - Visual Debugging & Monitoring

LiveURL provides real-time browser visualization for debugging and monitoring automated workflows. Request a LiveURL to see exactly what your automation script encounters in a live browser view.

---

## Use Cases

- **Debug automation issues** - See exactly what your script encounters
- **Monitor long-running jobs** - Check progress without interrupting execution
- **Verify page states** - Confirm your script reached the expected state
- **Team collaboration** - Share a live view with teammates for troubleshooting
- **Visual logging** - Inspect automation state at key moments

---

## How It Works

1. **Create a CDP Session** during your automation workflow
2. **Listen for completion** by registering a `liveComplete` event handler
3. **Request a LiveURL** with optional timeout (defaults to 5 minutes)
4. **Share the URL** with a user (log it, send via notification, display in UI)
5. **User interacts** by opening the URL in any browser
6. **User signals done** by clicking the "Done" button or waiting for timeout
7. **Script continues** after the `liveComplete` event fires

---

## CDP Commands

BotCloud extends the Chrome DevTools Protocol with these commands:

### `liveURL` - Request an interactive viewing session

```javascript
const { liveURL } = await cdpSession.send('liveURL', {
  timeout: 120000  // Optional: milliseconds before auto-timeout (default: 300000)
});
// Returns: { liveURL: "https://cloud.bots.win/live/abc123def456" }
```

### `liveComplete` - Event fired when user clicks "Done" or timeout expires

```javascript
cdpSession.on('liveComplete', () => {
  console.log('User finished interaction');
  // Continue automation...
});
```

### `switchPage` - Switch to a different page

Switch the live view to a different page within the same browser session:

```javascript
// Get the target ID of the new page
const newPage = await browser.newPage();
const targetId = newPage.target()._targetId;

// Switch LiveURL view to the new page
await cdpSession.send('switchPage', { targetId });
```

---

## Page Switching

LiveURL supports switching between pages within a single viewing session.

### Use Cases

- **Multi-tab workflows** - Switch between tabs during debugging
- **Page navigation tracking** - Follow automation across page changes
- **Popup handling** - View popup windows or new tabs

### Session Cleanup

LiveURL sessions are automatically cleaned up when:
- The associated page is closed or navigated away
- The browser session ends
- The `liveComplete` event is triggered

This ensures resources are properly released without manual intervention.

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

### With Async/Await Helper

```javascript
function waitForLiveComplete(cdp) {
  return new Promise((resolve) => {
    cdp.once("liveComplete", resolve);
  });
}

// Usage
const { liveURL } = await cdp.send("liveURL", { timeout: 300000 });
console.log(`LiveURL: ${liveURL}`);

await waitForLiveComplete(cdp);
console.log("Continuing automation...");
```

---

## Viewer Features

When a user opens the LiveURL in their browser:

- **Real-time screen updates** - Approximately 5-10 FPS live view
- **Full interaction** - Click, type, scroll, and navigate
- **Mouse tracking** - Visual cursor position indicator
- **Keyboard input** - Full keyboard support including special keys
- **Done button** - Signals completion and returns control to script

---

## Access & Billing

| Aspect | Details |
|--------|---------|
| **Access** | Requires LiveURL access enabled on your account |
| **Billing Premium** | +0.35x multiplier when LiveURL is enabled |

**Note:** LiveURL access is an account-level permission. Contact your service provider to enable this feature if needed.

---

## Important Notes

| Aspect | Details |
|--------|---------|
| **Limit** | One LiveURL per browser session |
| **Security** | Tokens are single-use and expire after timeout or completion |
| **Updates** | Real-time screen at approximately 5-10 FPS |
| **Interaction** | Full click, type, scroll, navigate support |
| **Quota** | LiveURL time counts toward usage quota (with +0.35x premium) |
| **Timeout** | `liveComplete` fires on both user completion and timeout |

---

## Error Handling

```javascript
try {
  const { liveURL } = await cdp.send("liveURL", { timeout: 120000 });
  console.log(`LiveURL: ${liveURL}`);

  // Set up timeout fallback
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("LiveURL timeout")), 130000)
  );

  await Promise.race([
    waitForLiveComplete(cdp),
    timeoutPromise
  ]);
} catch (error) {
  console.error("LiveURL error:", error.message);
  // Handle gracefully - maybe continue automation anyway
}
```

---

## Working Examples

See the complete working examples in:
- [`examples/liveurl/node/puppeteer-liveurl.mjs`](../examples/liveurl/node/puppeteer-liveurl.mjs)
- [`examples/liveurl/node/playwright-liveurl.mjs`](../examples/liveurl/node/playwright-liveurl.mjs)

---

[← Back to README](../README.md)
