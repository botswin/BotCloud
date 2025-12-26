# BotCloud Responsible Use Guidelines

BotCloud is a commercial anti-detection cloud browser service. Every customer shares the same infrastructure, so one team’s workload can affect everyone else. Please keep the following ground rules in mind before you launch new jobs.

## Before You Start

- Operate only on systems you own or on systems where you have written authorization for automation or security testing.
- Route traffic through proxies that you control and that comply with local regulations.
- Use synthetic or anonymized data unless a contract explicitly allows real user information.
- Review and follow the terms of service for every third-party website, API, or SaaS product you access through BotCloud.

## You Must Not

- Bypass anti-abuse or anti-tracking mechanisms on production services without explicit permission from the owner.
- Harvest credentials, tokens, personal data, or payment details belonging to third parties.
- Resell or share BotCloud access with organizations that do not have a direct agreement with us.
- Use the platform for spam, fraud, ticket scalping, sneaker/reservation hoarding, or any other automated abuse.
- Attempt to compromise BotCloud infrastructure, probe other customers, or interfere with service operations.

## Incident & Abuse Handling

If you discover that one of your workloads misbehaved, or you receive a complaint from a third party, pause the job immediately and notify the BotCloud support channel with timestamps, token IDs, and proxy information. We will help investigate and, if necessary, notify affected partners. Repeated or silent incidents can result in account suspension.

## Security Hygiene

- Store tokens, proxy credentials, and any downloaded artifacts in encrypted locations with limited access.
- Rotate credentials on a regular schedule and after every suspected leak.
- Keep detailed logs of when and where each token is used. These logs must be provided upon request during audits or investigations.

## Publication & Sharing

When presenting automation research or results that rely on BotCloud, clearly document the defensive objective. Redact partner data, avoid disclosing step-by-step bypass instructions, and respect any embargo agreements tied to your contract.

By continuing to use BotCloud you acknowledge (1) the [Legal Disclaimer](DISCLAIMER.md), (2) these Responsible Use rules, and (3) any additional requirements in your commercial agreement. Contact the support team before you run new workloads if you have any doubts about authorization or scope.
