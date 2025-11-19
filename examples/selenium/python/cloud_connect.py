"""Selenium + CDP sample demonstrating BotCloud control."""
import base64
import os
import urllib.parse
from selenium.webdriver.common.bidi import cdp
from selenium.webdriver.common.devtools.v124 import page, target

if "BOTCLOUD_TOKEN" not in os.environ or "BOTCLOUD_PROXY" not in os.environ:
    raise RuntimeError("BOTCLOUD_TOKEN / BOTCLOUD_PROXY must be configured")

params = urllib.parse.urlencode({
    "token": os.environ["BOTCLOUD_TOKEN"],
    "--proxy-server": os.environ["BOTCLOUD_PROXY"],
})
endpoint = f"wss://cloud.bots.win?{params}"

connection = cdp.CDPConnection(endpoint)
session = cdp.CDPSession(connection)

session.execute(target.attach_to_browser_target())
session.execute(page.enable())
session.execute(page.navigate(url="https://example.com"))
screenshot = session.execute(page.capture_screenshot())
with open("selenium-screenshot.png", "wb") as handle:
    handle.write(base64.b64decode(screenshot.get("data", "")))
