/**
 * BotCloud User Data Management - Node.js Example
 *
 * This example demonstrates how to create, use, and manage persistent User Data
 * for preserving browser state (cookies, localStorage, login sessions) across sessions.
 *
 * Prerequisites:
 *   npm install puppeteer-core
 *
 * Usage:
 *   1. Modify the CONFIG section below with your token and proxy
 *   2. Run: node examples/user-data/node/user-data.mjs
 *
 * What this example does:
 *   1. Creates a new User Data directory
 *   2. Lists all User Data entries and displays quota
 *   3. Connects to browser using the User Data (first visit)
 *   4. Saves some data to localStorage
 *   5. Reconnects using the same User Data (second visit)
 *   6. Verifies that localStorage data persisted
 *   7. Deletes the User Data when done
 */

// ============ Configuration (Modify these) ============
const CONFIG = {
  token: "your-token-here",
  proxy: "username:password@proxy.example.com:4600",
  deviceType: "mac", // or "win", "android"
  apiBase: "https://cloud.bots.win",
};
// ======================================================

import puppeteer from 'puppeteer-core';

/**
 * Make an authenticated API request to BotCloud
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${CONFIG.apiBase}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${CONFIG.token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API Error (${response.status}): ${text}`);
  }

  return response.json();
}

/**
 * Create a new User Data entry
 */
async function createUserData() {
  console.log('📦 Creating new User Data...');
  const data = await apiRequest('/api/user-data', { method: 'POST' });
  console.log(`✅ Created User Data: ${data.id}`);
  console.log(`   Created at: ${data.createdAt}`);
  return data.id;
}

/**
 * List all User Data entries
 */
async function listUserData() {
  console.log('\n📋 Listing User Data entries...');
  const data = await apiRequest('/api/user-data');

  console.log(`\nTotal entries: ${data.total}`);
  console.log(`Quota: ${data.quota.used}/${data.quota.max} (Can create: ${data.quota.canCreate})`);

  if (data.items.length > 0) {
    console.log('\nUser Data entries:');
    data.items.forEach(item => {
      console.log(`  - ${item.id}`);
      console.log(`    Created: ${item.createdAt}`);
      console.log(`    Last used: ${item.lastUsedAt || 'Never'}`);
      console.log(`    Locked: ${item.isLocked ? 'Yes (in use)' : 'No'}`);
    });
  }
}

/**
 * Delete a User Data entry
 */
async function deleteUserData(userDataId) {
  console.log(`\n🗑️  Deleting User Data: ${userDataId}...`);
  await apiRequest(`/api/user-data/${userDataId}`, { method: 'DELETE' });
  console.log('✅ User Data deleted successfully');
}

/**
 * Build WebSocket endpoint URL with optional User Data
 */
function buildEndpoint(userDataId = null) {
  if (!CONFIG.token || !CONFIG.proxy) {
    throw new Error('Please configure TOKEN and PROXY in the CONFIG section above');
  }

  const params = new URLSearchParams({
    token: CONFIG.token,
    '--proxy-server': CONFIG.proxy,
    device_type: CONFIG.deviceType,
  });

  // Add User Data ID if provided
  if (userDataId) {
    params.set('user_data_id', userDataId);
  }

  return `wss://cloud.bots.win?${params.toString()}`;
}

/**
 * Connect to browser and perform automation
 */
async function runBrowserSession(userDataId, sessionName) {
  console.log(`\n🌐 ${sessionName}...`);

  let browser;
  try {
    browser = await puppeteer.connect({
      browserWSEndpoint: buildEndpoint(userDataId),
    });

    console.log('   Connected! Opening page...');
    const page = await browser.newPage();

    console.log('   Navigating to example.com...');
    await page.goto('https://example.com', { waitUntil: 'networkidle0' });

    // On first visit, set some data in localStorage
    if (sessionName.includes('First')) {
      console.log('   Setting test data in localStorage...');
      await page.evaluate(() => {
        localStorage.setItem('botcloud_test', 'persistent_data');
        localStorage.setItem('session_count', '1');
      });
      console.log('   ✅ Data saved to localStorage');
    }

    // On second visit, verify data persisted
    if (sessionName.includes('Second')) {
      console.log('   Checking if localStorage data persisted...');
      const data = await page.evaluate(() => {
        return {
          testData: localStorage.getItem('botcloud_test'),
          sessionCount: localStorage.getItem('session_count'),
        };
      });

      if (data.testData === 'persistent_data') {
        console.log('   ✅ SUCCESS! Data persisted across sessions:');
        console.log(`      botcloud_test: ${data.testData}`);
        console.log(`      session_count: ${data.sessionCount}`);
      } else {
        console.log('   ❌ FAILURE: Data did not persist');
      }
    }

    console.log('   Closing browser...');
    await browser.close();
    console.log('   ✅ Browser closed');

  } catch (error) {
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('BotCloud User Data Management Example');
  console.log('='.repeat(60));

  let userDataId;

  try {
    // 1. Create User Data
    userDataId = await createUserData();

    // 2. List all User Data
    await listUserData();

    // 3. First browser session - save data
    await runBrowserSession(userDataId, 'First visit - Saving data');

    // 4. Second browser session - verify persistence
    await runBrowserSession(userDataId, 'Second visit - Verifying persistence');

    // 5. List User Data again (check lastUsedAt updated)
    await listUserData();

    console.log('\n' + '='.repeat(60));
    console.log('✅ All operations completed successfully!');
    console.log('='.repeat(60));
    console.log('\nKey takeaways:');
    console.log('  • User Data preserves cookies, localStorage, and login states');
    console.log('  • Each User Data has a unique ID (udd_xxx)');
    console.log('  • User Data persists until explicitly deleted');
    console.log('  • Check quota limits before creating new User Data');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;

  } finally {
    // 6. Clean up - delete the User Data
    if (userDataId) {
      try {
        await deleteUserData(userDataId);
      } catch (error) {
        console.error('Failed to delete User Data:', error.message);
      }
    }
  }
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
