"""Async Playwright sample demonstrating BotCloud connectivity."""
import asyncio
import os
import urllib.parse
from playwright.async_api import async_playwright


def build_endpoint() -> str:
    params = urllib.parse.urlencode({
        "token": os.environ["BOTCLOUD_TOKEN"],
        "--proxy-server": os.environ["BOTCLOUD_PROXY"],
        "device_type": os.getenv("BOTCLOUD_DEVICE", "mac"),
    })
    return f"wss://cloud.bots.win?{params}"


async def main() -> None:
    if "BOTCLOUD_TOKEN" not in os.environ or "BOTCLOUD_PROXY" not in os.environ:
        raise RuntimeError("BOTCLOUD_TOKEN / BOTCLOUD_PROXY must be configured")

    async with async_playwright() as playwright:
        browser = await playwright.chromium.connect_over_cdp(build_endpoint())
        context = browser.contexts[0] if browser.contexts else await browser.new_context()
        page = await context.new_page()
        await page.goto("https://example.com")
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
