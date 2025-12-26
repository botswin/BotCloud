// BotCloud Quick Start - rod (Go)
//
// This example demonstrates connecting to BotCloud using rod's
// low-level CDP API with proper WebSocket key handling.
//
// Prerequisites:
//
//	go mod init your-project
//	go get github.com/go-rod/rod
//
// Usage:
//
//	1. Modify the CONFIG section below with your token and proxy
//	2. Run: go run rod-quickstart.go
//
// IMPORTANT: rod Compatibility Notes
// ===================================
// rod's high-level API (rod.New().ControlURL().MustConnect()) uses "nil" as
// the Sec-WebSocket-Key header, which violates RFC 6455 and is rejected by
// standard WebSocket servers including BotCloud.
//
// This example uses rod's low-level CDP API with a proper WebSocket key,
// which works correctly with BotCloud. If you need rod's high-level API,
// consider using chromedp instead as it's fully compatible.
//
// Why rod's high-level API doesn't work:
// 1. rod.New().ControlURL(url).MustConnect() internally calls cdp.MustConnectWS()
// 2. MustConnectWS() doesn't pass custom headers, using default "nil" as WS key
// 3. RFC 6455 requires Sec-WebSocket-Key to be a base64-encoded 16-byte value
// 4. "nil" doesn't satisfy this requirement, so the connection is rejected
package main

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/go-rod/rod/lib/cdp"
	"github.com/go-rod/rod/lib/utils"
)

// ============ Configuration (Modify these) ============
var CONFIG = struct {
	Token      string
	Proxy      string
	DeviceType string
}{
	Token:      "your-token-here",
	Proxy:      "username:password@proxy.example.com:4600",
	DeviceType: "mac", // or "win", "android"
}

// ======================================================

// generateWebSocketKey generates a proper RFC 6455 compliant WebSocket key.
// This is required because rod's default implementation uses "nil" which
// is rejected by standard WebSocket servers.
func generateWebSocketKey() string {
	key := make([]byte, 16)
	rand.Read(key)
	return base64.StdEncoding.EncodeToString(key)
}

func getConfig() (token, proxy, deviceType string) {
	// Override config with environment variables if set
	token = os.Getenv("BOTCLOUD_TOKEN")
	if token == "" {
		token = CONFIG.Token
	}
	proxy = os.Getenv("BOTCLOUD_PROXY")
	if proxy == "" {
		proxy = CONFIG.Proxy
	}
	deviceType = os.Getenv("BOTCLOUD_DEVICE_TYPE")
	if deviceType == "" {
		deviceType = CONFIG.DeviceType
	}

	if token == "" || token == "your-token-here" {
		log.Fatal("Please configure your token in CONFIG or BOTCLOUD_TOKEN environment variable")
	}
	if proxy == "" || proxy == "username:password@proxy.example.com:4600" {
		log.Fatal("Please configure your proxy in CONFIG or BOTCLOUD_PROXY environment variable")
	}
	return
}

func main() {
	token, proxy, deviceType := getConfig()

	log.Println("=== rod Low-Level API Quick Start ===")

	// Step 1: Get WebSocket URL from /json/version endpoint
	// This is optional - you can also construct the URL directly
	httpURL := fmt.Sprintf("https://cloud.bots.win/json/version?token=%s", token)
	log.Printf("Step 1: GET %s", httpURL)

	resp, err := http.Get(httpURL)
	if err != nil {
		log.Fatalf("Failed to get /json/version: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		log.Fatalf("Failed: %d - %s", resp.StatusCode, string(body))
	}

	var versionInfo struct {
		Browser              string `json:"Browser"`
		ProtocolVersion      string `json:"Protocol-Version"`
		WebSocketDebuggerUrl string `json:"webSocketDebuggerUrl"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&versionInfo); err != nil {
		log.Fatalf("Failed to parse response: %v", err)
	}

	log.Printf("Browser: %s", versionInfo.Browser)
	log.Printf("Protocol: %s", versionInfo.ProtocolVersion)

	// Step 2: Add parameters to WebSocket URL
	wsURL := fmt.Sprintf("%s&--proxy-server=%s&device_type=%s",
		versionInfo.WebSocketDebuggerUrl, proxy, deviceType)
	log.Printf("\nStep 2: Connecting to WebSocket...")

	// Step 3: Connect using rod's low-level CDP API with proper WebSocket key
	ctx := context.Background()

	ws := &cdp.WebSocket{}
	wsKey := generateWebSocketKey()
	log.Printf("Using RFC 6455 compliant Sec-WebSocket-Key: %s...", wsKey[:8])

	// Pass the proper WebSocket key in headers
	err = ws.Connect(ctx, wsURL, http.Header{
		"Sec-WebSocket-Key": {wsKey},
	})
	if err != nil {
		log.Fatalf("WebSocket connection failed: %v", err)
	}

	client := cdp.New().Start(ws)

	// Consume CDP events in the background (required by rod's CDP client)
	go func() {
		for range client.Event() {
			utils.Noop()
		}
	}()

	log.Println("Connected successfully!")

	// Step 4: Run CDP commands
	// Get browser version
	res, err := client.Call(ctx, "", "Browser.getVersion", nil)
	if err != nil {
		log.Fatalf("Browser.getVersion failed: %v", err)
	}

	var version struct {
		Product         string `json:"product"`
		ProtocolVersion string `json:"protocolVersion"`
		UserAgent       string `json:"userAgent"`
	}
	if err := json.Unmarshal(res, &version); err != nil {
		log.Fatalf("Failed to parse version: %v", err)
	}

	log.Println("\n=== Browser Properties ===")
	log.Printf("Product: %s", version.Product)
	log.Printf("Protocol Version: %s", version.ProtocolVersion)
	log.Printf("User-Agent: %s", version.UserAgent)

	// Create a new page target
	targetParams := map[string]string{"url": "https://example.com"}
	res, err = client.Call(ctx, "", "Target.createTarget", targetParams)
	if err != nil {
		log.Fatalf("Target.createTarget failed: %v", err)
	}

	var target struct {
		TargetId string `json:"targetId"`
	}
	if err := json.Unmarshal(res, &target); err != nil {
		log.Fatalf("Failed to parse target: %v", err)
	}
	log.Printf("\nCreated target: %s", target.TargetId)

	log.Println("\n✅ Done! rod low-level API successfully connected to BotCloud.")
	log.Println("\nNote: For a simpler API, consider using chromedp which is fully compatible with BotCloud.")
}
