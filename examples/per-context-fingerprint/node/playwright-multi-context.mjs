/**
 * Per-Context Fingerprint Example - Playwright
 *
 * ENT Tier3 feature: Run multiple independent fingerprint identities within a single
 * browser instance. Each BrowserContext can have its own timezone, languages, locale,
 * proxy IP, and other fingerprint configurations.
 *
 * Benefits:
 * - ~85% resource reduction compared to multiple browser instances
 * - Shared GPU/Network/Browser process (~55 processes vs 200+ for multiple browsers)
 * - Faster context creation (<100ms vs 2-5s for new browser)
 *
 * Requirements:
 * - ENT Tier3 subscription
 * - max_contexts_per_session > 1
 */

import { chromium } from "playwright-core";

// Configuration
const BOTCLOUD_TOKEN = process.env.BOTCLOUD_TOKEN || "your-ent3-token";
const PROXY_SERVER = process.env.PROXY_SERVER || "user:pass@proxy.example.com:4600";
const BOTCLOUD_ENDPOINT = process.env.BOTCLOUD_ENDPOINT || "wss://cloud.bots.win";

async function main() {
  console.log("Per-Context Fingerprint Demo (Playwright)");
  console.log("==========================================\n");

  // Connect to BotCloud via CDP
  const params = new URLSearchParams({
    token: BOTCLOUD_TOKEN,
    "--proxy-server": PROXY_SERVER,
    device_type: "mac",
  });

  const browser = await chromium.connectOverCDP(
    `${BOTCLOUD_ENDPOINT}?${params.toString()}`
  );

  try {
    // Get the default context and create a CDP session
    const defaultContext = browser.contexts()[0];
    const page = defaultContext.pages()[0] || (await defaultContext.newPage());
    const client = await page.context().newCDPSession(page);

    // ========================================
    // Create Context 1: Tokyo (Japan)
    // ========================================
    console.log("Creating Context 1 (Tokyo, Japan)...");
    const { browserContextId: ctx1 } = await client.send(
      "Target.createBrowserContext",
      {
        botCloudFlags: [
          "--bot-config-timezone=Asia/Tokyo",
          "--bot-config-languages=ja-JP,en-US",
          "--bot-config-locale=ja-JP",
        ],
      }
    );
    console.log(`  Context 1 ID: ${ctx1}`);

    // ========================================
    // Create Context 2: New York (USA)
    // ========================================
    console.log("Creating Context 2 (New York, USA)...");
    const { browserContextId: ctx2 } = await client.send(
      "Target.createBrowserContext",
      {
        botCloudFlags: [
          "--bot-config-timezone=America/New_York",
          "--bot-config-languages=en-US,es-ES",
          "--bot-config-locale=en-US",
        ],
      }
    );
    console.log(`  Context 2 ID: ${ctx2}`);

    // ========================================
    // Create targets and verify fingerprints
    // ========================================
    console.log("\nVerifying fingerprint isolation...");

    const contexts = [
      { id: ctx1, name: "Tokyo" },
      { id: ctx2, name: "New York" },
    ];

    for (const ctx of contexts) {
      // Create target in context
      const { targetId } = await client.send("Target.createTarget", {
        url: "about:blank",
        browserContextId: ctx.id,
      });

      // Attach to target
      const { sessionId } = await client.send("Target.attachToTarget", {
        targetId: targetId,
        flatten: true,
      });

      // Enable Runtime
      await client.send("Runtime.enable", {}, sessionId);

      // Get fingerprint info
      const timezone = await client.send(
        "Runtime.evaluate",
        {
          expression: "Intl.DateTimeFormat().resolvedOptions().timeZone",
          returnByValue: true,
        },
        sessionId
      );

      const language = await client.send(
        "Runtime.evaluate",
        {
          expression: "navigator.language",
          returnByValue: true,
        },
        sessionId
      );

      console.log(`\n${ctx.name} Context:`);
      console.log(`  Timezone: ${timezone.result.value}`);
      console.log(`  Language: ${language.result.value}`);
    }

    // ========================================
    // Alternative: Set flags on existing context
    // ========================================
    console.log("\n--- Alternative: setBrowserContextFlags ---");
    console.log("Creating new context and setting flags afterwards...");

    const { browserContextId: ctx3 } = await client.send(
      "Target.createBrowserContext"
    );
    console.log(`  Context 3 ID: ${ctx3}`);

    // Set flags on existing context
    await client.send("BotBrowser.setBrowserContextFlags", {
      browserContextId: ctx3,
      botCloudFlags: [
        "--bot-config-timezone=Europe/London",
        "--bot-config-languages=en-GB,en-US",
      ],
    });
    console.log("  Flags set successfully");

    // Verify
    const { targetId: target3 } = await client.send("Target.createTarget", {
      url: "about:blank",
      browserContextId: ctx3,
    });
    const { sessionId: session3 } = await client.send("Target.attachToTarget", {
      targetId: target3,
      flatten: true,
    });
    await client.send("Runtime.enable", {}, session3);

    const tz3 = await client.send(
      "Runtime.evaluate",
      {
        expression: "Intl.DateTimeFormat().resolvedOptions().timeZone",
        returnByValue: true,
      },
      session3
    );
    console.log(`\nLondon Context (via setBrowserContextFlags):`);
    console.log(`  Timezone: ${tz3.result.value}`);

    // ========================================
    // Cleanup
    // ========================================
    console.log("\nCleaning up contexts...");
    await client.send("Target.disposeBrowserContext", { browserContextId: ctx1 });
    await client.send("Target.disposeBrowserContext", { browserContextId: ctx2 });
    await client.send("Target.disposeBrowserContext", { browserContextId: ctx3 });

    console.log("\n✓ Demo completed successfully!");
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
