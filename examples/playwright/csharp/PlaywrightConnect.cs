using System;
using System.Collections.Specialized;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Playwright;

namespace BotCloudSamples;

public static class PlaywrightConnect
{
    private static string BuildEndpoint()
    {
        var values = new NameValueCollection
        {
            ["token"] = Environment.GetEnvironmentVariable("BOTCLOUD_TOKEN"),
            ["--proxy-server"] = Environment.GetEnvironmentVariable("BOTCLOUD_PROXY"),
            ["device_type"] = Environment.GetEnvironmentVariable("BOTCLOUD_DEVICE") ?? "mac",
        };

        return "wss://cloud.bots.win?" + string.Join("&",
            values.AllKeys
                .Where(key => !string.IsNullOrEmpty(values[key]))
                .Select(key => $"{key}={Uri.EscapeDataString(values[key]!)}"));
    }

    public static async Task Main()
    {
        if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("BOTCLOUD_TOKEN")) ||
            string.IsNullOrEmpty(Environment.GetEnvironmentVariable("BOTCLOUD_PROXY")))
        {
            throw new InvalidOperationException("BOTCLOUD_TOKEN / BOTCLOUD_PROXY must be configured");
        }

        using var playwright = await Playwright.CreateAsync();
        var browser = await playwright.Chromium.ConnectAsync(new BrowserTypeConnectOptions
        {
            WsEndpoint = BuildEndpoint(),
        });
        var context = await browser.NewContextAsync();
        var page = await context.NewPageAsync();
        await page.GotoAsync("https://example.com");
        await browser.CloseAsync();
    }
}
