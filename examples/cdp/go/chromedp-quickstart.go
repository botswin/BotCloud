// BotCloud Quick Start - chromedp (Go)
//
// This example demonstrates connecting to BotCloud using chromedp,
// the most popular Go library for browser automation via CDP.
//
// Prerequisites:
//
//	go mod init your-project
//	go get github.com/chromedp/chromedp
//
// Usage:
//
//	1. Modify the CONFIG section below with your token and proxy
//	2. Run: go run chromedp-quickstart.go
//
// Note: chromedp is fully compatible with BotCloud and is the
// recommended Go library for browser automation.
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/chromedp/chromedp"
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

func buildEndpoint() string {
	// Override config with environment variables if set
	token := os.Getenv("BOTCLOUD_TOKEN")
	if token == "" {
		token = CONFIG.Token
	}
	proxy := os.Getenv("BOTCLOUD_PROXY")
	if proxy == "" {
		proxy = CONFIG.Proxy
	}
	deviceType := os.Getenv("BOTCLOUD_DEVICE_TYPE")
	if deviceType == "" {
		deviceType = CONFIG.DeviceType
	}

	if token == "" || token == "your-token-here" {
		log.Fatal("Please configure your token in CONFIG or BOTCLOUD_TOKEN environment variable")
	}
	if proxy == "" || proxy == "username:password@proxy.example.com:4600" {
		log.Fatal("Please configure your proxy in CONFIG or BOTCLOUD_PROXY environment variable")
	}

	// Build WebSocket URL with query parameters
	// chromedp supports both ws:// and wss:// schemes
	return fmt.Sprintf("wss://cloud.bots.win?token=%s&--proxy-server=%s&device_type=%s",
		token, proxy, deviceType)
}

func main() {
	log.Println("Connecting to BotCloud via chromedp...")
	wsURL := buildEndpoint()

	// Create a remote allocator connected to BotCloud
	// chromedp.NewRemoteAllocator handles the WebSocket connection
	allocCtx, allocCancel := chromedp.NewRemoteAllocator(context.Background(), wsURL)
	defer allocCancel()

	// Create context with timeout (recommended for production)
	ctx, cancel := context.WithTimeout(allocCtx, 60*time.Second)
	defer cancel()

	// Create a new browser context
	ctx, cancel = chromedp.NewContext(ctx)
	defer cancel()

	// Variables to store results
	var userAgent string
	var title string

	// Run automation tasks
	log.Println("Connected! Running automation tasks...")
	err := chromedp.Run(ctx,
		// Navigate to a test page
		chromedp.Navigate("https://example.com"),

		// Wait for page to load
		chromedp.WaitReady("body"),

		// Get page title
		chromedp.Title(&title),

		// Get user agent (verifies fingerprint masking)
		chromedp.Evaluate(`navigator.userAgent`, &userAgent),
	)
	if err != nil {
		log.Fatalf("Automation failed: %v", err)
	}

	// Display results
	log.Println("\n=== Results ===")
	log.Printf("Page Title: %s", title)
	log.Printf("User-Agent: %s", userAgent)

	log.Println("\n✅ Done! chromedp successfully connected to BotCloud.")
}
