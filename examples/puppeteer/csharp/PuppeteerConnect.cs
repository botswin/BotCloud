using System;
using System.Collections.Specialized;
using System.Linq;
using System.Threading.Tasks;
using PuppeteerSharp;

namespace BotCloudSamples;

public static class PuppeteerConnect
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

        await new BrowserFetcher().DownloadAsync();
        var browser = await Puppeteer.ConnectAsync(new ConnectOptions
        {
            BrowserWSEndpoint = BuildEndpoint(),
        });
        var page = await browser.NewPageAsync();
        await page.GoToAsync("https://example.com");
        await browser.CloseAsync();
    }
}
