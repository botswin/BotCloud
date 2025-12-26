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
  "totalQuota": 10000,
  "usedQuota": 2350,
  "remainingQuota": 7650,
  "percentUsed": 23.5
}
```

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

BotCloud uses usage-based billing:

| Unit | Cost |
|------|------|
| 1 minute of browser session time | 1 quota unit |

> Pricing is still being finalized. Contact your service provider for the latest unit costs.

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
