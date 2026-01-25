# API Reference

All REST API endpoints are hosted at `https://cloud.bots.win/api` and require Bearer token authentication:

```bash
Authorization: Bearer your-user-token-here
```

---

## Quota & Usage

### GET /api/quota

Check remaining quota before launching jobs.

```bash
curl -H "Authorization: Bearer your-token" https://cloud.bots.win/api/quota
```

**Response:**
```json
{
  "remainingQuota": 7650,
  "sessions": {
    "max": 5,
    "active": 2
  },
  "pricing": {
    "baseRate": 1,
    "current": {
      "multiplier": 1.3,
      "effectiveRate": 1.3
    },
    "max": {
      "multiplier": 1.8,
      "effectiveRate": 1.8
    },
    "breakdown": {
      "sessionMultiplier": 1.3,
      "cloakTierPremium": 0.5,
      "contextMultiplier": 1.0,
      "userDataPremium": 0.1,
      "devtoolsPremium": 0.35,
      "superStealthPremium": 0.40
    }
  }
}
```

**Response Fields:**

| Field | Description |
|-------|-------------|
| `remainingQuota` | Available quota balance |
| `sessions.max` | Maximum allowed concurrent sessions |
| `sessions.active` | Currently active sessions |
| `pricing.baseRate` | Base quota consumption per minute |
| `pricing.current` | Billing rate based on current active sessions |
| `pricing.max` | Billing rate if using maximum sessions |
| `pricing.breakdown` | Detailed multiplier components |
| `pricing.breakdown.sessionMultiplier` | Multiplier based on concurrent session count |
| `pricing.breakdown.cloakTierPremium` | Premium for Cloak Tier (basic/pro/ent1/ent2/ent3) |
| `pricing.breakdown.contextMultiplier` | Multiplier for Multi-Context feature (1.0 = disabled, 1.5 = enabled) |
| `pricing.breakdown.userDataPremium` | Premium for User Data quota |
| `pricing.breakdown.devtoolsPremium` | Premium for DevTools access (+0.35) |
| `pricing.breakdown.superStealthPremium` | Premium for Super Stealth Mode (+0.40) |

### GET /api/usage

Get usage statistics for reporting and cost analysis.

```bash
curl -H "Authorization: Bearer your-token" https://cloud.bots.win/api/usage
```

**Response:**
```json
{
  "totalSessions": 142,
  "totalMinutes": 2350,
  "activeSessions": 1
}
```

---

## Session History

### GET /api/history

Retrieve session history for audit trails. Supports optional `start` and `end` query parameters (ISO 8601 timestamps).

```bash
curl -H "Authorization: Bearer your-token" https://cloud.bots.win/api/history
```

**With date range:**
```bash
curl -H "Authorization: Bearer your-token" \
  "https://cloud.bots.win/api/history?start=2025-01-01T00:00:00Z&end=2025-01-31T23:59:59Z"
```

**Response:**
```json
{
  "sessions": [
    {
      "id": 1,
      "startedAt": "2025-01-15T10:30:00Z",
      "endedAt": "2025-01-15T10:33:25Z",
      "durationMinutes": 3,
      "quotaConsumed": 3,
      "disconnectReason": "client_closed"
    }
  ],
  "total": 1
}
```

**Disconnect Reasons:**

| Reason | Description |
|--------|-------------|
| `client_closed` | Client called `browser.close()` |
| `client_disconnected` | WebSocket connection closed unexpectedly |
| `server_closed` | Browser server closed the connection |
| `insufficient_balance` | Quota exhausted during session |
| `socket_timeout` | No data transferred for 5 minutes |
| `tcp_error` | Network error |

---

## User Data Management

User Data enables persistent browser state (cookies, localStorage, login sessions) and fingerprint binding across sessions.

### POST /api/user-data

Create a new User Data entry.

```bash
curl -X POST \
  -H "Authorization: Bearer your-token" \
  https://cloud.bots.win/api/user-data
```

**Response:**
```json
{
  "id": "udd_abc123def456xyz0",
  "createdAt": "2025-01-15T10:30:00Z"
}
```

**Error Codes:**
| Code | Message | Description |
|------|---------|-------------|
| 403 | `NO_PERMISSION` | User does not have permission to create User Data |
| 429 | `QUOTA_EXCEEDED` | User Data quota limit reached |

### GET /api/user-data

List all User Data entries owned by the authenticated user.

```bash
curl -H "Authorization: Bearer your-token" \
  https://cloud.bots.win/api/user-data
```

**Response:**
```json
{
  "items": [
    {
      "id": "udd_abc123def456xyz0",
      "createdAt": "2025-01-15T10:30:00Z",
      "lastUsedAt": "2025-01-16T08:00:00Z",
      "isLocked": false
    }
  ],
  "total": 1,
  "quota": {
    "used": 1,
    "max": 5,
    "canCreate": true
  }
}
```

**Field Descriptions:**
| Field | Description |
|-------|-------------|
| `isLocked` | True when User Data is currently in use by an active session |
| `quota.used` | Number of User Data entries created |
| `quota.max` | Maximum allowed User Data entries |
| `quota.canCreate` | Whether user can create more User Data |

### DELETE /api/user-data/:id

Delete a User Data entry and its associated browser data.

```bash
curl -X DELETE \
  -H "Authorization: Bearer your-token" \
  https://cloud.bots.win/api/user-data/udd_abc123def456xyz0
```

**Response:**
```json
{
  "success": true
}
```

**Error Codes:**
| Code | Description |
|------|-------------|
| 404 | User Data not found |
| 403 | Access denied (not owned by user) |
| 409 | User Data is currently in use (locked) |

---

## Using User Data

User Data enables:
- **Fingerprint Persistence**: Same device identity across sessions (canvas, WebGL, audio fingerprints)
- **State Persistence**: Cookies, localStorage, and login states survive session restarts
- **Session Lock**: Only one active session can use a `user_data_id` at a time

### Example Workflow

```javascript
// 1. Create User Data
const response = await fetch('https://cloud.bots.win/api/user-data', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
const { id: userDataId } = await response.json();

// 2. Connect with User Data
const params = new URLSearchParams({
  token: 'your-token',
  '--proxy-server': 'username:password@proxy.example.com:4600',
  user_data_id: userDataId
});

const browser = await puppeteer.connect({
  browserWSEndpoint: `wss://cloud.bots.win?${params.toString()}`
});

// 3. Browser state persists across sessions
// Cookies, localStorage, and fingerprint remain consistent
```

See [`examples/user-data/`](../examples/user-data/) for complete working examples.

---

## Fingerprint Binding

User Data enables fingerprint persistence across sessions:

| Scenario | Fingerprint | Browser State |
|----------|-------------|---------------|
| With `user_data_id` | Persistent (bound to user_data_id + device_type) | Persistent |
| Without `user_data_id` | Fresh each session | Not persisted |

**[View Fingerprint Management Guide →](fingerprint.md)**

---

## WebSocket Connection

Connect to BotCloud via WebSocket:

```
wss://cloud.bots.win?token=xxx&--proxy-server=user:pass@host:port&device_type=mac
```

See [CLI Parameters](cli-parameters.md) for all available connection parameters.

---

## Billing

BotCloud uses dynamic usage-based billing. Your rate is calculated based on actual resource usage.

### Billing Formula

```
Total Multiplier = Session Multiplier × Context Multiplier + Cloak Tier Premium + User Data Premium + DevTools Premium + Super Stealth Premium
Effective Rate = Base Rate × Total Multiplier
```

- **Base rate**: 1 quota per minute
- **Context Multiplier**: 1.0x (standard) or 1.5x (Multi-Context enabled, ENT3 required)

### Session Multiplier

Based on concurrent session count:

| Sessions | Multiplier |
|----------|------------|
| 1 | 1.0x |
| 2-5 | 1.3x |
| 6-10 | 1.8x |
| 11-20 | 2.7x |
| 21-50 | 4.5x |
| 51-100 | 6.0x |
| 101-200 | 10.5x |
| 201-300 | 15.5x |
| 301-500 | 23.0x |
| 501-1000 | 44.0x |

### Cloak Tier Premium

| Tier | Premium | Features |
|------|---------|----------|
| basic | +0 | Proxy support (HTTP/HTTPS/SOCKS5/SOCKS5H), noise controls (Canvas/WebGL/Audio/ClientRects/TextRects), auto geo detection from proxy IP, Playwright/Puppeteer integration, cross-platform profiles (mac/win), basic WebRTC control |
| pro | +1.0 | + Random history injection (`--bot-inject-random-history`), always-active windows (`--bot-always-active`), Android profile support |
| ent1 | +2.0 | + Cookie management (`--bot-cookies`), proxy IP specification (`--proxy-ip`), local DNS (`--bot-local-dns`), **per-context proxy**, custom geo override, console message suppression (`--bot-disable-console-message`), WebRTC ICE control (`--bot-webrtc-ice`) |
| ent2 | +3.0 | + Browser brand spoofing (`--bot-config-browser-brand`), deterministic noise seed (`--bot-noise-seed`), time scaling (`--bot-time-scale`), **precision FPS simulation**, **Widevine CDM**, **DRM simulation**, **extension sync** |
| ent3 | +4.0 | + SOCKS5 UDP/QUIC tunneling, Mirror distributed sync (`--bot-mirror-*`), **Multi-Context** (up to 10 contexts with per-context fingerprint) |

### Feature Premiums

| Feature | Premium | Description |
|---------|---------|-------------|
| DevTools | +0.35 | Remote browser debugging via Chrome DevTools |
| Super Stealth | +0.40 | Maximum anti-detection capability |
| Multi-Context | 1.5x | Up to 10 independent contexts per session (ENT3 required) |

**📖 [View detailed pricing →](https://bots.win/en/pricing/)**

---

## Error Responses

All API errors return JSON with an error message:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - No permission or quota exceeded |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource is locked |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

---

[← Back to README](../README.md)
