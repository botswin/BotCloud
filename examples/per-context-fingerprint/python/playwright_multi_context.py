"""
Per-Context Fingerprint Example - Python Playwright

ENT Tier3 feature: Run multiple independent fingerprint identities within a single
browser instance. Each BrowserContext can have its own timezone, languages, locale,
proxy IP, and other fingerprint configurations.

Benefits:
- ~85% resource reduction compared to multiple browser instances
- Shared GPU/Network/Browser process (~55 processes vs 200+ for multiple browsers)
- Faster context creation (<100ms vs 2-5s for new browser)

Requirements:
- ENT Tier3 subscription
- max_contexts_per_session > 1

Usage:
  BOTCLOUD_TOKEN=your-token PROXY_SERVER=user:pass@host:port python playwright_multi_context.py
"""

import os
from urllib.parse import urlencode
from playwright.sync_api import sync_playwright

# Configuration
BOTCLOUD_TOKEN = os.environ.get("BOTCLOUD_TOKEN", "your-ent3-token")
PROXY_SERVER = os.environ.get("PROXY_SERVER", "user:pass@proxy.example.com:4600")
BOTCLOUD_ENDPOINT = os.environ.get("BOTCLOUD_ENDPOINT", "wss://cloud.bots.win")


def main():
    print("Per-Context Fingerprint Demo (Python Playwright)")
    print("=" * 50)
    print()

    # Build connection URL
    params = {
        "token": BOTCLOUD_TOKEN,
        "--proxy-server": PROXY_SERVER,
        "device_type": "mac",
    }
    ws_endpoint = f"{BOTCLOUD_ENDPOINT}?{urlencode(params)}"

    with sync_playwright() as p:
        # Connect to BotCloud via CDP
        browser = p.chromium.connect_over_cdp(ws_endpoint)

        try:
            # Get the default context and create a CDP session
            default_context = browser.contexts[0]
            page = default_context.pages[0] if default_context.pages else default_context.new_page()
            client = default_context.new_cdp_session(page)

            # ========================================
            # Create Context 1: Tokyo (Japan)
            # ========================================
            print("Creating Context 1 (Tokyo, Japan)...")
            result1 = client.send(
                "Target.createBrowserContext",
                {
                    "botCloudFlags": [
                        "--bot-config-timezone=Asia/Tokyo",
                        "--bot-config-languages=ja-JP,en-US",
                        "--bot-config-locale=ja-JP",
                    ]
                },
            )
            ctx1 = result1["browserContextId"]
            print(f"  Context 1 ID: {ctx1}")

            # ========================================
            # Create Context 2: Sao Paulo (Brazil)
            # ========================================
            print("Creating Context 2 (Sao Paulo, Brazil)...")
            result2 = client.send(
                "Target.createBrowserContext",
                {
                    "botCloudFlags": [
                        "--bot-config-timezone=America/Sao_Paulo",
                        "--bot-config-languages=pt-BR,en-US",
                        "--bot-config-locale=pt-BR",
                    ]
                },
            )
            ctx2 = result2["browserContextId"]
            print(f"  Context 2 ID: {ctx2}")

            # ========================================
            # Verify fingerprint isolation
            # ========================================
            print("\nVerifying fingerprint isolation...")

            contexts = [
                {"id": ctx1, "name": "Tokyo"},
                {"id": ctx2, "name": "Sao Paulo"},
            ]

            for ctx in contexts:
                # Create target in context
                target_result = client.send(
                    "Target.createTarget",
                    {"url": "about:blank", "browserContextId": ctx["id"]},
                )
                target_id = target_result["targetId"]

                # Attach to target
                attach_result = client.send(
                    "Target.attachToTarget",
                    {"targetId": target_id, "flatten": True},
                )
                session_id = attach_result["sessionId"]

                # Enable Runtime
                client.send("Runtime.enable", {}, session_id)

                # Get timezone
                tz_result = client.send(
                    "Runtime.evaluate",
                    {
                        "expression": "Intl.DateTimeFormat().resolvedOptions().timeZone",
                        "returnByValue": True,
                    },
                    session_id,
                )
                timezone = tz_result["result"]["value"]

                # Get language
                lang_result = client.send(
                    "Runtime.evaluate",
                    {"expression": "navigator.language", "returnByValue": True},
                    session_id,
                )
                language = lang_result["result"]["value"]

                print(f"\n{ctx['name']} Context:")
                print(f"  Timezone: {timezone}")
                print(f"  Language: {language}")

            # ========================================
            # Demo: Use setBrowserContextFlags
            # ========================================
            print("\n--- Using setBrowserContextFlags ---")
            print("Creating context and setting flags afterwards...")

            result3 = client.send("Target.createBrowserContext")
            ctx3 = result3["browserContextId"]
            print(f"  Context 3 ID: {ctx3}")

            # Set flags on existing context
            client.send(
                "BotBrowser.setBrowserContextFlags",
                {
                    "browserContextId": ctx3,
                    "botCloudFlags": [
                        "--bot-config-timezone=Australia/Sydney",
                        "--bot-config-languages=en-AU,en-US",
                    ],
                },
            )
            print("  Flags set successfully")

            # ========================================
            # Cleanup
            # ========================================
            print("\nCleaning up contexts...")
            client.send("Target.disposeBrowserContext", {"browserContextId": ctx1})
            client.send("Target.disposeBrowserContext", {"browserContextId": ctx2})
            client.send("Target.disposeBrowserContext", {"browserContextId": ctx3})

            print("\n✓ Demo completed successfully!")
            print("\nNote: Each context had independent fingerprint configuration,")
            print("all running within a single browser instance.")

        finally:
            browser.close()


if __name__ == "__main__":
    main()
