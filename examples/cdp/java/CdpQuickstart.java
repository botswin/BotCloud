/**
 * BotCloud Quick Start - Native WebSocket (Java 11+)
 *
 * This example demonstrates connecting to BotCloud using Java's built-in
 * WebSocket API with direct CDP protocol communication.
 *
 * Prerequisites:
 *   Java 11 or higher (uses java.net.http.WebSocket)
 *
 * Usage:
 *   1. Modify the CONFIG section below with your token and proxy
 *   2. Compile: javac CdpQuickstart.java
 *   3. Run: java CdpQuickstart
 *
 * Note: Java's native WebSocket API (introduced in Java 11) provides
 * excellent performance and reliability for CDP connections. For higher-level
 * automation, consider using Playwright for Java with connectOverCDP().
 *
 * Why not cdp4j?
 * ===============
 * cdp4j is designed for launching and controlling LOCAL Chrome instances,
 * not for connecting to remote browsers. For remote BotCloud connections,
 * this native WebSocket approach is recommended.
 */

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.WebSocket;
import java.nio.ByteBuffer;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

public class CdpQuickstart {

    // ============ Configuration (Modify these) ============
    private static final String TOKEN = "your-token-here";
    private static final String PROXY = "username:password@proxy.example.com:4600";
    private static final String DEVICE_TYPE = "mac"; // or "win", "android"
    // ======================================================

    private final AtomicInteger messageId = new AtomicInteger(1);
    private final Map<Integer, CompletableFuture<String>> pendingRequests = new ConcurrentHashMap<>();
    private WebSocket webSocket;

    public static void main(String[] args) throws Exception {
        // Override config with environment variables if set
        String token = System.getenv("BOTCLOUD_TOKEN");
        if (token == null || token.isEmpty()) token = TOKEN;

        String proxy = System.getenv("BOTCLOUD_PROXY");
        if (proxy == null || proxy.isEmpty()) proxy = PROXY;

        String deviceType = System.getenv("BOTCLOUD_DEVICE_TYPE");
        if (deviceType == null || deviceType.isEmpty()) deviceType = DEVICE_TYPE;

        // Validate configuration
        if (token.equals("your-token-here")) {
            System.err.println("Please configure your token in the CONFIG section or BOTCLOUD_TOKEN environment variable");
            System.exit(1);
        }
        if (proxy.equals("username:password@proxy.example.com:4600")) {
            System.err.println("Please configure your proxy in the CONFIG section or BOTCLOUD_PROXY environment variable");
            System.exit(1);
        }

        new CdpQuickstart().run(token, proxy, deviceType);
    }

    public void run(String token, String proxy, String deviceType) throws Exception {
        System.out.println("=== BotCloud Java CDP Quick Start ===\n");

        // Build WebSocket URL
        String wsUrl = String.format(
            "wss://cloud.bots.win?token=%s&--proxy-server=%s&device_type=%s",
            token, proxy, deviceType
        );
        System.out.println("Connecting to BotCloud...");

        // Create WebSocket connection
        CountDownLatch connectLatch = new CountDownLatch(1);
        HttpClient client = HttpClient.newHttpClient();

        webSocket = client.newWebSocketBuilder()
            .buildAsync(URI.create(wsUrl), new WebSocket.Listener() {
                private StringBuilder messageBuffer = new StringBuilder();

                @Override
                public void onOpen(WebSocket ws) {
                    System.out.println("Connected!");
                    connectLatch.countDown();
                    ws.request(1);
                }

                @Override
                public CompletionStage<?> onText(WebSocket ws, CharSequence data, boolean last) {
                    messageBuffer.append(data);
                    if (last) {
                        handleMessage(messageBuffer.toString());
                        messageBuffer = new StringBuilder();
                    }
                    ws.request(1);
                    return null;
                }

                @Override
                public CompletionStage<?> onClose(WebSocket ws, int statusCode, String reason) {
                    System.out.println("Connection closed: " + statusCode + " - " + reason);
                    return null;
                }

                @Override
                public void onError(WebSocket ws, Throwable error) {
                    System.err.println("WebSocket error: " + error.getMessage());
                    error.printStackTrace();
                }
            })
            .join();

        // Wait for connection
        if (!connectLatch.await(30, TimeUnit.SECONDS)) {
            throw new RuntimeException("Connection timeout");
        }

        // Run CDP commands
        runAutomation();

        // Close connection
        webSocket.sendClose(WebSocket.NORMAL_CLOSURE, "Done");
        System.out.println("\n✅ Done! Java CDP successfully connected to BotCloud.");
    }

    private void runAutomation() throws Exception {
        // 1. Get browser version
        System.out.println("\n--- Browser.getVersion ---");
        String versionResult = sendCommand("Browser.getVersion", "{}");
        System.out.println("Browser Version: " + extractJsonField(versionResult, "product"));
        System.out.println("User-Agent: " + extractJsonField(versionResult, "userAgent"));

        // 2. Create a new page
        System.out.println("\n--- Target.createTarget ---");
        String targetResult = sendCommand("Target.createTarget", "{\"url\":\"https://example.com\"}");
        String targetId = extractJsonField(targetResult, "targetId");
        System.out.println("Created target: " + targetId);

        // 3. Attach to the target
        System.out.println("\n--- Target.attachToTarget ---");
        String attachResult = sendCommand("Target.attachToTarget",
            String.format("{\"targetId\":\"%s\",\"flatten\":true}", targetId));
        String sessionId = extractJsonField(attachResult, "sessionId");
        System.out.println("Attached with session: " + sessionId);

        // 4. Navigate and get page info (using session)
        System.out.println("\n--- Page.navigate ---");
        sendCommandWithSession(sessionId, "Page.enable", "{}");
        String navResult = sendCommandWithSession(sessionId, "Page.navigate",
            "{\"url\":\"https://example.com\"}");
        System.out.println("Navigated to: https://example.com");

        // Wait for page to load
        Thread.sleep(2000);

        // 5. Get page title
        System.out.println("\n--- Runtime.evaluate ---");
        String evalResult = sendCommandWithSession(sessionId, "Runtime.evaluate",
            "{\"expression\":\"document.title\",\"returnByValue\":true}");
        System.out.println("Page Title: " + evalResult);

        // 6. Clean up - close the target
        System.out.println("\n--- Target.closeTarget ---");
        sendCommand("Target.closeTarget", String.format("{\"targetId\":\"%s\"}", targetId));
        System.out.println("Target closed.");
    }

    private String sendCommand(String method, String params) throws Exception {
        return sendCommandInternal(null, method, params);
    }

    private String sendCommandWithSession(String sessionId, String method, String params) throws Exception {
        return sendCommandInternal(sessionId, method, params);
    }

    private String sendCommandInternal(String sessionId, String method, String params) throws Exception {
        int id = messageId.getAndIncrement();
        CompletableFuture<String> future = new CompletableFuture<>();
        pendingRequests.put(id, future);

        String message;
        if (sessionId != null) {
            message = String.format("{\"id\":%d,\"method\":\"%s\",\"params\":%s,\"sessionId\":\"%s\"}",
                id, method, params, sessionId);
        } else {
            message = String.format("{\"id\":%d,\"method\":\"%s\",\"params\":%s}",
                id, method, params);
        }

        webSocket.sendText(message, true);

        // Wait for response with timeout
        return future.get(30, TimeUnit.SECONDS);
    }

    private void handleMessage(String message) {
        // Try to extract message ID
        String idStr = extractJsonField(message, "id");
        if (idStr != null && !idStr.isEmpty()) {
            try {
                int id = Integer.parseInt(idStr);
                CompletableFuture<String> future = pendingRequests.remove(id);
                if (future != null) {
                    // Check for error
                    if (message.contains("\"error\"")) {
                        future.completeExceptionally(new RuntimeException("CDP Error: " + message));
                    } else {
                        future.complete(message);
                    }
                }
            } catch (NumberFormatException e) {
                // Not a response message
            }
        }
        // Events (messages without id) are ignored in this simple example
    }

    // Simple JSON field extractor (for demo purposes - use a JSON library in production)
    private static String extractJsonField(String json, String field) {
        String pattern = "\"" + field + "\":";
        int start = json.indexOf(pattern);
        if (start == -1) return null;

        start += pattern.length();
        // Skip whitespace
        while (start < json.length() && Character.isWhitespace(json.charAt(start))) {
            start++;
        }

        if (start >= json.length()) return null;

        if (json.charAt(start) == '"') {
            // String value
            int end = json.indexOf('"', start + 1);
            if (end == -1) return null;
            return json.substring(start + 1, end);
        } else if (json.charAt(start) == '{') {
            // Object value - find matching brace
            int braceCount = 1;
            int end = start + 1;
            while (end < json.length() && braceCount > 0) {
                if (json.charAt(end) == '{') braceCount++;
                else if (json.charAt(end) == '}') braceCount--;
                end++;
            }
            return json.substring(start, end);
        } else {
            // Number or boolean
            int end = start;
            while (end < json.length() && !",}]".contains(String.valueOf(json.charAt(end)))) {
                end++;
            }
            return json.substring(start, end).trim();
        }
    }
}
