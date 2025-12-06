"""BotCloud User Data Management - Python Example

This example demonstrates how to create, use, and manage persistent User Data
for preserving browser state (cookies, localStorage, login sessions) across sessions.

Prerequisites:
    pip install playwright aiohttp
    playwright install chromium

Usage:
    1. Modify the CONFIG section below with your token and proxy
    2. Run: python examples/user-data/python/user_data.py

What this example does:
    1. Creates a new User Data directory
    2. Lists all User Data entries and displays quota
    3. Connects to browser using the User Data (first visit)
    4. Saves some data to localStorage
    5. Reconnects using the same User Data (second visit)
    6. Verifies that localStorage data persisted
    7. Deletes the User Data when done
"""

# ============ Configuration (Modify these) ============
CONFIG = {
    "token": "your-token-here",
    "proxy": "username:password@proxy.example.com:4600",
    "device_type": "mac",  # or "win", "android"
    "api_base": "https://cloud.bots.win",
}
# ======================================================

import asyncio
import urllib.parse
from typing import Optional, Dict, Any
import aiohttp
from playwright.async_api import async_playwright


async def api_request(
    session: aiohttp.ClientSession,
    endpoint: str,
    method: str = "GET"
) -> Dict[str, Any]:
    """Make an authenticated API request to BotCloud."""
    url = f"{CONFIG['api_base']}{endpoint}"
    headers = {
        "Authorization": f"Bearer {CONFIG['token']}",
        "Content-Type": "application/json",
    }

    async with session.request(method, url, headers=headers) as response:
        if not response.ok:
            text = await response.text()
            raise RuntimeError(f"API Error ({response.status}): {text}")
        return await response.json()


async def create_user_data(session: aiohttp.ClientSession) -> str:
    """Create a new User Data entry."""
    print("📦 Creating new User Data...")
    data = await api_request(session, "/api/user-data", method="POST")
    print(f"✅ Created User Data: {data['id']}")
    print(f"   Created at: {data['createdAt']}")
    return data["id"]


async def list_user_data(session: aiohttp.ClientSession) -> None:
    """List all User Data entries."""
    print("\n📋 Listing User Data entries...")
    data = await api_request(session, "/api/user-data")

    print(f"\nTotal entries: {data['total']}")
    quota = data["quota"]
    print(f"Quota: {quota['used']}/{quota['max']} (Can create: {quota['canCreate']})")

    if data["items"]:
        print("\nUser Data entries:")
        for item in data["items"]:
            print(f"  - {item['id']}")
            print(f"    Created: {item['createdAt']}")
            print(f"    Last used: {item.get('lastUsedAt', 'Never')}")
            locked = "Yes (in use)" if item["isLocked"] else "No"
            print(f"    Locked: {locked}")


async def delete_user_data(session: aiohttp.ClientSession, user_data_id: str) -> None:
    """Delete a User Data entry."""
    print(f"\n🗑️  Deleting User Data: {user_data_id}...")
    await api_request(session, f"/api/user-data/{user_data_id}", method="DELETE")
    print("✅ User Data deleted successfully")


def build_endpoint(user_data_id: Optional[str] = None) -> str:
    """Build BotCloud WebSocket endpoint URL with optional User Data."""
    if not CONFIG["token"] or not CONFIG["proxy"]:
        raise RuntimeError("Please configure token and proxy in CONFIG section above")

    params = {
        "token": CONFIG["token"],
        "--proxy-server": CONFIG["proxy"],
        "device_type": CONFIG["device_type"],
    }

    # Add User Data ID if provided
    if user_data_id:
        params["user_data_id"] = user_data_id

    query_string = urllib.parse.urlencode(params)
    return f"wss://cloud.bots.win?{query_string}"


async def run_browser_session(user_data_id: str, session_name: str) -> None:
    """Connect to browser and perform automation."""
    print(f"\n🌐 {session_name}...")

    async with async_playwright() as playwright:
        browser = None
        try:
            browser = await playwright.chromium.connect_over_cdp(
                build_endpoint(user_data_id)
            )

            print("   Connected! Opening page...")
            context = browser.contexts[0] if browser.contexts else await browser.new_context()
            page = await context.new_page()

            print("   Navigating to example.com...")
            await page.goto("https://example.com")

            # On first visit, set some data in localStorage
            if "First" in session_name:
                print("   Setting test data in localStorage...")
                await page.evaluate("""() => {
                    localStorage.setItem('botcloud_test', 'persistent_data');
                    localStorage.setItem('session_count', '1');
                }""")
                print("   ✅ Data saved to localStorage")

            # On second visit, verify data persisted
            if "Second" in session_name:
                print("   Checking if localStorage data persisted...")
                data = await page.evaluate("""() => {
                    return {
                        testData: localStorage.getItem('botcloud_test'),
                        sessionCount: localStorage.getItem('session_count')
                    };
                }""")

                if data["testData"] == "persistent_data":
                    print("   ✅ SUCCESS! Data persisted across sessions:")
                    print(f"      botcloud_test: {data['testData']}")
                    print(f"      session_count: {data['sessionCount']}")
                else:
                    print("   ❌ FAILURE: Data did not persist")

            print("   Closing browser...")
            await browser.close()
            print("   ✅ Browser closed")

        except Exception as error:
            if browser:
                await browser.close()
            raise error


async def main() -> None:
    """Main execution function."""
    print("=" * 60)
    print("BotCloud User Data Management Example")
    print("=" * 60)

    user_data_id = None

    async with aiohttp.ClientSession() as session:
        try:
            # 1. Create User Data
            user_data_id = await create_user_data(session)

            # 2. List all User Data
            await list_user_data(session)

            # 3. First browser session - save data
            await run_browser_session(user_data_id, "First visit - Saving data")

            # 4. Second browser session - verify persistence
            await run_browser_session(user_data_id, "Second visit - Verifying persistence")

            # 5. List User Data again (check lastUsedAt updated)
            await list_user_data(session)

            print("\n" + "=" * 60)
            print("✅ All operations completed successfully!")
            print("=" * 60)
            print("\nKey takeaways:")
            print("  • User Data preserves cookies, localStorage, and login states")
            print("  • Each User Data has a unique ID (udd_xxx)")
            print("  • User Data persists until explicitly deleted")
            print("  • Check quota limits before creating new User Data")

        except Exception as error:
            print(f"\n❌ Error: {error}")
            raise

        finally:
            # 6. Clean up - delete the User Data
            if user_data_id:
                try:
                    await delete_user_data(session, user_data_id)
                except Exception as error:
                    print(f"Failed to delete User Data: {error}")


if __name__ == "__main__":
    asyncio.run(main())
