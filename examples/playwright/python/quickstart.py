"""BotCloud Quick Start - Playwright (Python)

This shows how to connect to BotCloud using Playwright's async API.

Prerequisites:
    pip install playwright
    playwright install chromium

Usage:
    1. Modify the CONFIG section below with your token and proxy
    2. Run: python examples/quickstart/playwright-python.py
"""

# ============ Configuration (Modify these) ============
CONFIG = {
    "token": "your-token-here",
    "proxy": "username:password@proxy.example.com:4600",
    "device_type": "mac"  # or "win", "android"
}
# ======================================================

import asyncio
import urllib.parse
from playwright.async_api import async_playwright


def build_endpoint() -> str:
    """Build BotCloud WebSocket endpoint URL."""
    if not CONFIG["token"] or not CONFIG["proxy"]:
        raise RuntimeError("Please configure token and proxy in CONFIG section above")

    params = urllib.parse.urlencode({
        "token": CONFIG["token"],
        "--proxy-server": CONFIG["proxy"],
        "device_type": CONFIG["device_type"],
    })
    return f"wss://cloud.bots.win?{params}"


async def main() -> None:
    """Main execution function."""
    print("Connecting to BotCloud...")
    async with async_playwright() as playwright:
        browser = await playwright.chromium.connect_over_cdp(build_endpoint())

        print("Connected! Getting context...")
        context = browser.contexts[0] if browser.contexts else await browser.new_context()
        page = await context.new_page()

        print("Navigating to example.com...")
        await page.goto("https://example.com")

        print("Taking screenshot...")
        await page.screenshot(path="screenshot.png")

        print("Closing browser...")
        await browser.close()

        print("✅ Done! Check screenshot.png")


if __name__ == "__main__":
    asyncio.run(main())
