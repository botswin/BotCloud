# BotCloud Operations (Draft)

This note summarizes the customer runbook content that usually lives in private wikis. Expand or adapt it to your environment as you integrate BotCloud.

## Monitoring & Telemetry

1. Query `https://cloud.bots.win/api/quota` and `https://cloud.bots.win/api/history` every few minutes; forward the results to your metrics stack (Prometheus, Datadog, etc.).
2. Track active sessions, bandwidth, screenshot counts, and error rate as separate metrics so you can alert on unusual spikes.
3. Tag every metric with `token_id`, `proxy_pool`, and `environment` to speed up incident triage.
4. Pipe BotCloud client logs (stdout/stderr from examples) into your SIEM so investigators can tie proxy records back to user stories.

## Bridging WebDriver / Selenium Hub

Some teams expose BotCloud to existing Selenium Hub clients instead of updating scripts directly. A lightweight approach:

1. Run a headless Selenium Grid router in your VPC.
2. For each incoming `newSession` request, translate desired capabilities to BotCloud connection params (token, proxy, `device_type`).
3. Use the Cloud WebSocket endpoint as the downstream target via BiDi/CDP (see `examples/selenium/csharp/SeleniumBidi.cs`).
4. Map Selenium commands to BiDi calls and relay results back to the client; close the Cloud session whenever the upstream session ends.

Keep strict rate limits on the bridge service, because BotCloud quotas are tied to tokens, not Selenium nodes.

## Quota & Incident Playbooks

- **Quota burn:** When remaining credits drop below your alarm threshold, notify the operations chat and automatically throttle non-critical jobs until balance is restored.
- **Abuse complaint:** Pause the offending workload, gather timestamps/proxy IDs/token IDs, and contact BotCloud support via your account channel within one business day.
- **Proxy outage:** Keep at least two proxy pools per environment. On disconnect events, rotate to a healthy pool before reattempting the job.

## Next Steps

This document will grow as we publish more runbooks. If you need richer diagrams or sample Terraform/Ansible snippets, ping the support team and reference the section you want to prioritize.
