using System;
using System.Threading.Tasks;
using OpenQA.Selenium.BiDi;
using OpenQA.Selenium.BiDi.Modules.BrowsingContext;

namespace BotCloudSamples;

public static class SeleniumBidi
{
    public static async Task Main()
    {
        var token = Environment.GetEnvironmentVariable("BOTCLOUD_TOKEN");
        var proxy = Environment.GetEnvironmentVariable("BOTCLOUD_PROXY");
        if (string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(proxy))
        {
            throw new InvalidOperationException("BOTCLOUD_TOKEN / BOTCLOUD_PROXY must be configured");
        }

        var query = $"token={Uri.EscapeDataString(token)}&--proxy-server={Uri.EscapeDataString(proxy)}";
        var endpoint = new Uri($"wss://cloud.bots.win?{query}");

        await using var session = await BiDiSession.Connect(endpoint);
        var module = session.GetModule<BrowsingContextModule>();
        var context = await module.CreateTopLevelBrowsingContext();
        await module.Navigate(context, new NavigateParameters
        {
            Url = "https://example.com",
        });
        await module.Close(context);
    }
}
