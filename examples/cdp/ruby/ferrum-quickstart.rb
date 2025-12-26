#!/usr/bin/env ruby
# frozen_string_literal: true

# BotCloud Quick Start - Ferrum (Ruby)
#
# This example demonstrates connecting to BotCloud using Ferrum,
# a high-level browser automation library for Ruby built on CDP.
#
# Prerequisites:
#   gem install ferrum
#   # Or via Bundler: bundle add ferrum
#
# Usage:
#   1. Modify the CONFIG section below with your token and proxy
#   2. Run: ruby ferrum-quickstart.rb
#
# IMPORTANT: Ferrum Compatibility Notes
# =====================================
# When connecting to remote browsers like BotCloud, you MUST use the
# `ws_url` parameter instead of the `url` parameter.
#
# Why `ws_url` instead of `url`:
# - `url` parameter: Ferrum calls /json/version to discover the WebSocket URL,
#   but it uses URI.join() which loses query parameters (token, proxy, etc.)
# - `ws_url` parameter: Directly provides the WebSocket URL, preserving all
#   query parameters needed for authentication and configuration
#
# Correct:   Ferrum::Browser.new(ws_url: "wss://cloud.bots.win?token=xxx")
# Incorrect: Ferrum::Browser.new(url: "https://cloud.bots.win?token=xxx")

require 'ferrum'

# ============ Configuration (Modify these) ============
CONFIG = {
  token: 'your-token-here',
  proxy: 'username:password@proxy.example.com:4600',
  device_type: 'mac' # or "win", "android"
}.freeze
# ======================================================

def get_config
  # Override config with environment variables if set
  token = ENV['BOTCLOUD_TOKEN'] || CONFIG[:token]
  proxy = ENV['BOTCLOUD_PROXY'] || CONFIG[:proxy]
  device_type = ENV['BOTCLOUD_DEVICE_TYPE'] || CONFIG[:device_type]

  if token == 'your-token-here'
    abort 'Please configure your token in CONFIG or BOTCLOUD_TOKEN environment variable'
  end

  if proxy == 'username:password@proxy.example.com:4600'
    abort 'Please configure your proxy in CONFIG or BOTCLOUD_PROXY environment variable'
  end

  [token, proxy, device_type]
end

def build_ws_url(token, proxy, device_type)
  # Build WebSocket URL with query parameters
  # IMPORTANT: Use wss:// for secure connections
  params = URI.encode_www_form(
    token: token,
    '--proxy-server': proxy,
    device_type: device_type
  )
  "wss://cloud.bots.win?#{params}"
end

def main
  puts '=== BotCloud Ferrum Quick Start ==='
  puts

  token, proxy, device_type = get_config

  ws_url = build_ws_url(token, proxy, device_type)
  puts "Connecting to BotCloud..."
  puts "(Using ws_url parameter for direct WebSocket connection)"
  puts

  browser = nil
  begin
    # IMPORTANT: Use ws_url parameter, NOT url parameter
    # ws_url directly connects to the WebSocket endpoint
    # url would call /json/version and lose query parameters
    browser = Ferrum::Browser.new(ws_url: ws_url)
    puts "Connected!"

    # Navigate to a test page
    puts "\nNavigating to example.com..."
    browser.go_to('https://example.com')

    # Get page title
    title = browser.evaluate('document.title')
    puts "Page Title: #{title}"

    # Get browser fingerprint info (verifies fingerprint masking)
    puts "\n=== Browser Properties ==="
    user_agent = browser.evaluate('navigator.userAgent')
    puts "User-Agent: #{user_agent}"

    webdriver = browser.evaluate('navigator.webdriver')
    puts "navigator.webdriver: #{webdriver}"

    platform = browser.evaluate('navigator.platform')
    puts "Platform: #{platform}"

    # Take a screenshot
    puts "\nTaking screenshot..."
    browser.screenshot(path: 'screenshot.png')
    puts "Screenshot saved to screenshot.png"

  rescue StandardError => e
    puts "Error: #{e.message}"
    puts e.backtrace.first(5).join("\n")
    exit 1
  ensure
    # Always close the browser to release quota
    browser&.quit
  end

  puts "\n✅ Done! Ferrum successfully connected to BotCloud."
end

# Run the example
main if __FILE__ == $PROGRAM_NAME
