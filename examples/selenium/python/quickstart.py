"""BotCloud Quick Start - Selenium (Python)

This shows how to connect to BotCloud using Selenium WebDriver.

Prerequisites:
    pip install selenium

Usage:
    1. Modify the CONFIG section below with your token and proxy
    2. Run: python examples/quickstart/selenium-python.py
"""

# ============ Configuration (Modify these) ============
CONFIG = {
    "token": "your-token-here",
    "proxy": "username:password@proxy.example.com:4600",
    "device_type": "mac"  # or "win", "android"
}
# ======================================================

import urllib.parse
from selenium import webdriver
from selenium.webdriver.common.options import ArgOptions


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


def main() -> None:
    """Main execution function."""
    print("Connecting to BotCloud...")
    options = ArgOptions()
    options.add_argument("--remote-debugging-port=9222")

    driver = webdriver.Remote(
        command_executor=build_endpoint(),
        options=options
    )

    try:
        print("Connected! Navigating to example.com...")
        driver.get("https://example.com")

        print("Taking screenshot...")
        driver.save_screenshot("screenshot.png")

        print("✅ Done! Check screenshot.png")

    finally:
        print("Closing browser...")
        driver.quit()


if __name__ == "__main__":
    main()
