# CLI Parameters Reference

BotCloud supports 50+ CLI parameters for runtime fingerprint configuration. These parameters are passed via the WebSocket connection URL as query string arguments.

**Key Features:**
- Smart auto-configuration: BotCloud derives timezone, locale, and languages from proxy IP
- Dynamic configuration: Override any setting at connection time
- 50+ parameters for complete fingerprint control

---

## Required Parameters

| Parameter | Example | Description |
|-----------|---------|-------------|
| `token` | `user-abc123` | API access token (required) |
| `--proxy-server` | `user:pass@host:port` | Proxy server with credentials (required) |

---

## Device & Identity

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `device_type` | `mac` / `win` / `android` | `mac` | Device fingerprint profile |
| `user_data_id` | `udd_xxxxxxxxxxxx` | - | User Data ID for persistent state |
| `--bot-config-timezone` | `America/New_York`, `auto` | `auto` | Timezone (auto = from proxy IP) |
| `--bot-config-locale` | `en-US`, `ja-JP`, `auto` | `auto` | Browser locale |
| `--bot-config-languages` | `en,zh,ja` | `auto` | Language preferences (comma-separated) |
| `--bot-config-location` | `35.6762,139.6503` | `auto` | Geolocation coordinates (lat,lng) |

### Fingerprint Assignment Behavior

BotCloud intelligently assigns fingerprints based on your connection parameters:

| Scenario | Fingerprint Behavior |
|----------|---------------------|
| With `user_data_id` | Persistently bound to `user_data_id + device_type` combination |
| Without `user_data_id` | Fresh fingerprint assigned for each session |
| Same User Data, different `device_type` | Each device type maintains its own independent fingerprint |

**Key Points**:
- Each `device_type` (mac, win, android) has its own pool of fingerprints with realistic device-specific characteristics
- Fingerprints include consistent canvas, WebGL, audio context, screen dimensions, and navigator properties
- Without `user_data_id`, you get a unique identity every time - ideal for scenarios requiring fresh browser profiles

---

## Browser Brand & Version

| Parameter | Values | Description |
|-----------|--------|-------------|
| `--bot-config-browser-brand` | `chrome` / `chromium` / `edge` / `brave` / `opera` | Browser brand emulation |
| `--bot-config-brand-full-version` | `142.0.3595.65` | Brand-specific version for UA-CH |
| `--bot-config-ua-full-version` | `142.0.7444.60` | User agent full version |

---

## Display & Input

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `--bot-config-window` | `profile` / `real` | `profile` | Window dimensions source |
| `--bot-config-screen` | `profile` / `real` | `profile` | Screen properties source |
| `--bot-config-keyboard` | `profile` / `real` | `profile` | Keyboard layout |
| `--bot-config-fonts` | `profile` / `expand` / `real` | `profile` | Font enumeration source |
| `--bot-config-color-scheme` | `light` / `dark` | `light` | Preferred color scheme |
| `--bot-config-disable-device-scale-factor` | `true` / `false` | `false` | Disable device scale |

---

## Rendering & Noise Control

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `--bot-config-webgl` | `profile` / `real` / `disabled` | `profile` | WebGL rendering mode |
| `--bot-config-webgpu` | `profile` / `real` / `disabled` | `profile` | WebGPU mode |
| `--bot-config-noise-canvas` | `true` / `false` | `true` | Canvas fingerprint noise |
| `--bot-config-noise-webgl-image` | `true` / `false` | `true` | WebGL image noise |
| `--bot-config-noise-audio-context` | `true` / `false` | `true` | Audio context noise |
| `--bot-config-noise-client-rects` | `true` / `false` | `false` | Client rects noise |
| `--bot-config-noise-text-rects` | `true` / `false` | `true` | Text rects noise |

---

## Media & WebRTC

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `--bot-config-webrtc` | `profile` / `real` / `disabled` | `profile` | WebRTC mode |
| `--bot-config-media-devices` | `profile` / `real` | `profile` | Media devices source |
| `--bot-config-media-types` | `expand` / `profile` / `real` | `expand` | Media types handling |
| `--bot-config-speech-voices` | `profile` / `real` | `profile` | Speech synthesis voices |

---

## Behavior Switches

| Parameter | Description |
|-----------|-------------|
| `--bot-disable-debugger` | Ignore JavaScript debugger statements |
| `--bot-always-active` | Keep window active even when unfocused |
| `--bot-disable-console-message` | Suppress console output from CDP logs |
| `--bot-inject-random-history` | Inject synthetic browsing history |
| `--bot-webrtc-ice` | Override STUN/TURN endpoints |
| `--bot-time-scale` | Scale performance.now() intervals (0.80-0.99) |
| `--bot-noise-seed` | Deterministic noise seed (1.0-1.2) |
| `--bot-title` | Custom browser window title |
| `--bot-mobile-force-touch` | Force touch events on mobile emulation |
| `--bot-cookies` | Pre-set cookies (JSON array format) |
| `--bot-bookmarks` | Pre-set bookmarks (JSON array format) |

---

## Proxy Configuration

| Parameter | Description |
|-----------|-------------|
| `--proxy-server` | Proxy URL with credentials (required) |
| `--proxy-ip` | Skip IP detection for performance |
| `--bot-local-dns` | Use local DNS resolver |
| `--bot-ip-service` | Custom IP detection service URL |

**Supported Proxy Protocols:**
- HTTP: `http://user:pass@host:port`
- HTTPS: `https://user:pass@host:port`
- SOCKS5: `socks5://user:pass@host:port`
- SOCKS5H: `socks5h://user:pass@host:port` (hostname resolved by proxy)

**UDP over SOCKS5:** Automatic SOCKS5 UDP ASSOCIATE support tunnels QUIC traffic and STUN probes through the proxy.

---

## Usage Examples

### Basic Connection

```javascript
const params = new URLSearchParams({
  token: 'your-token',
  '--proxy-server': 'user:pass@proxy.example.com:8080',
  device_type: 'mac'
});

const browser = await puppeteer.connect({
  browserWSEndpoint: `wss://cloud.bots.win?${params}`
});
```

### Custom Timezone & Locale

```javascript
const params = new URLSearchParams({
  token: 'your-token',
  '--proxy-server': 'user:pass@proxy.example.com:8080',
  device_type: 'win',
  '--bot-config-timezone': 'Europe/London',
  '--bot-config-locale': 'en-GB',
  '--bot-config-languages': 'en,fr'
});
```

### Full Noise Injection

```javascript
const params = new URLSearchParams({
  token: 'your-token',
  '--proxy-server': 'user:pass@proxy.example.com:8080',
  device_type: 'mac',
  '--bot-config-noise-canvas': 'true',
  '--bot-config-noise-webgl-image': 'true',
  '--bot-config-noise-audio-context': 'true',
  '--bot-disable-debugger': 'true'
});
```

---

## Configuration Priority

1. **CLI parameters** (Highest priority) - Query string parameters
2. **Device profile defaults** (Medium priority) - Based on device_type
3. **Auto-detection** (Lowest priority) - From proxy IP

---

## Auto-Detection Behavior

When set to `auto`, BotCloud derives values from your proxy IP:

| Setting | Auto Behavior |
|---------|---------------|
| timezone | Detected from proxy IP geolocation |
| locale | Inferred from timezone region |
| languages | Primary language of detected region |
| location | Approximate coordinates from IP |

**Tip:** Let auto-detection handle these unless you need specific overrides. This ensures fingerprint consistency with your proxy's geographic location.

---

## Best Practices

1. **Use auto-detection** for timezone/locale unless you have specific requirements
2. **Enable noise injection** for canvas, audio, and WebGL to prevent fingerprint tracking
3. **Use `--bot-disable-debugger`** to avoid pauses in automated workflows
4. **Specify `--proxy-ip`** if known to skip IP detection overhead
5. **Match timezone/locale** with proxy location for consistency
6. **URL-encode special characters** in proxy credentials (use `encodeURIComponent`)

---

[← Back to README](../README.md)
