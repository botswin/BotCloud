/**
 * Per-Context Fingerprint Example - Puppeteer
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

import puppeteer from "puppeteer-core";

// Configuration
const BOTCLOUD_TOKEN = process.env.BOTCLOUD_TOKEN || "your-ent3-token";
const PROXY_SERVER = process.env.PROXY_SERVER || "user:pass@proxy.example.com:4600";
const BOTCLOUD_ENDPOINT = process.env.BOTCLOUD_ENDPOINT || "wss://cloud.bots.win";

async function main() {
  console.log("Per-Context Fingerprint Demo (Puppeteer)");
  console.log("========================================\n");

  // Connect to BotCloud
  const params = new URLSearchParams({
    token: BOTCLOUD_TOKEN,
    "--proxy-server": PROXY_SERVER,
    device_type: "mac",
  });

  const browser = await puppeteer.connect({
    browserWSEndpoint: `${BOTCLOUD_ENDPOINT}?${params.toString()}`,
  });

  try {
    // Get CDP session from default page
    const pages = await browser.pages();
    const page = pages[0] || (await browser.newPage());
    const client = await page.target().createCDPSession();

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
    // Create Context 3: Berlin (Germany)
    // ========================================
    console.log("Creating Context 3 (Berlin, Germany)...");
    const { browserContextId: ctx3 } = await client.send(
      "Target.createBrowserContext",
      {
        botCloudFlags: [
          "--bot-config-timezone=Europe/Berlin",
          "--bot-config-languages=de-DE,en-US",
          "--bot-config-locale=de-DE",
        ],
      }
    );
    console.log(`  Context 3 ID: ${ctx3}`);

    // ========================================
    // Create pages in each context
    // ========================================
    console.log("\nCreating pages in each context...");

    const contexts = [
      { id: ctx1, name: "Tokyo" },
      { id: ctx2, name: "New York" },
      { id: ctx3, name: "Berlin" },
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

      const languages = await client.send(
        "Runtime.evaluate",
        {
          expression: "JSON.stringify(navigator.languages)",
          returnByValue: true,
        },
        sessionId
      );

      console.log(`\n${ctx.name} Context:`);
      console.log(`  Timezone: ${timezone.result.value}`);
      console.log(`  Language: ${language.result.value}`);
      console.log(`  Languages: ${languages.result.value}`);
    }

    // ========================================
    // Cleanup
    // ========================================
    console.log("\nCleaning up contexts...");
    for (const ctx of contexts) {
      await client.send("Target.disposeBrowserContext", {
        browserContextId: ctx.id,
      });
      console.log(`  Disposed: ${ctx.name}`);
    }

    console.log("\n✓ Demo completed successfully!");
    console.log("\nNote: Each context had independent fingerprint configuration,");
    console.log("all running within a single browser instance.");
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
