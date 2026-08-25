Android Security & Privacy Platform — Master Development Prompt

ROLE

Act as a senior Android engineer, security engineer, product designer, UX designer, and QA engineer.

I am building a consumer Android security and privacy application.

The application should feel like a premium, trustworthy, modern security platform, not a basic antivirus or a developer utility.

I am developing this application myself with AI assistance, so:

Keep the architecture maintainable.

Prefer simple, reliable implementations.

Do not introduce unnecessary dependencies.

Do not rewrite working backend/security code unnecessarily.

Reuse existing functionality wherever possible.

Before changing existing code, inspect and understand it.

Never fake security functionality.

Never display a security result that the application cannot actually verify.

Clearly distinguish between confirmed facts, heuristics, and recommendations.

Follow Android platform restrictions and Google Play policies.

1. CORE PRODUCT VISION

Build an Android security/privacy platform based around six major systems:

Device Security

App Intelligence

Network Protection

Privacy Intelligence

Continuous Monitoring & Alerts

AI Security Assistant

The eventual product should also support:

Malware/Threat Intelligence

Advanced Network Analysis

Family/Cross-device Protection

Premium subscriptions

The product should progressively evolve rather than requiring every advanced capability immediately.

2. PRIMARY UI PRINCIPLE

The user must understand these three things immediately:

Am I protected?

Example:

87/100 — Protected

What needs attention?

Example:

2 things need attention

What should I do?

Example:

Review → Fix → Done

The UI should be understandable within approximately five seconds.

Do not overload the user with technical information.

Technical details should be available through secondary screens.

3. VISUAL DESIGN

Use a premium, modern, calm security-app aesthetic.

Avoid:

Hacker-style interfaces

Excessive red

Excessive warning icons

Cluttered dashboards

Excessive charts

Technical jargon

Too many buttons

Use:

Clean cards

Generous spacing

Clear typography

Strong visual hierarchy

Simple icons

Subtle animations

Clear status indicators

Light mode

Dark mode

Accessible contrast

Consistent component design

Use red only for genuine high-risk situations.

Use warning colors only when something actually needs attention.

The UI should feel trustworthy rather than frightening.

4. MAIN NAVIGATION

Use bottom navigation with five primary sections:

Home

Overall device security.

Apps

Installed application intelligence.

Network

VPN, DNS protection, blocking, network events and Wi-Fi security.

Privacy

Privacy Radar, permissions and tracker intelligence.

More

Settings, reports, account, subscription, help and advanced options.

Do not create unnecessary navigation levels.

5. HOME — SECURITY CENTER

The Home screen is the main dashboard.

Display:

Security Score

Large central score:

87 / 100

Status:

Protected

Good

Needs Attention

At Risk

Critical

The score must be calculated from real available data.

Do not invent values.

Protection Status

Show:

VPN Protection

DNS Protection

Threat Protection

Tracker Blocking

App Monitoring

Privacy Monitoring

Each should show:

ON

OFF

ATTENTION

NOT AVAILABLE

Things That Need Attention

Example:

High-risk application detected

Unknown-source installation enabled

USB debugging enabled

Public Wi-Fi detected

VPN disconnected

Each item must have:

Review

or, where Android permits it:

Fix

Today's Activity

Show:

Threats blocked

Trackers blocked

Applications analyzed

Security changes detected

Network events

Only show real collected data.

Quick Actions

Scan Device

Network Protection

App Security

Privacy Radar

Hardening Report

6. DEVICE SECURITY / HARDENING

Use the existing getHardeningReport() functionality.

Do not recreate the security logic if it already exists.

Connect it to a polished UI.

Display checks such as:

Screen lock

Encryption

Security patch status

Play Protect status where available

Private DNS

USB debugging

Developer options

Unknown app installation configuration

VPN status

Device security configuration

Root/unlocked-device indicators where technically reliable

Each check should have:

PASS

WARNING

FAIL

UNKNOWN

Each issue should explain:

What is wrong?

Why does it matter?

How can I fix it?

Where Android allows it, provide a button that opens the appropriate system settings.

Do not claim an issue is fixed until the device state confirms it.

7. APP INTELLIGENCE

The Apps screen must display real installed applications.

Fix the existing manifest/application-inventory issue first.

Features:

Installed-app inventory

App name

Package name

Version

Developer/package information where available

Install/update information where available

Permission analysis

Risk score

Privacy score

Sideload status where technically determinable

Recently installed

Recently updated

Unused applications

High-permission applications

High-risk applications

Filters:

All

Risky

New

Updated

Sideloaded

Unused

Search must work.

8. APP DETAIL SCREEN

For each application show:

Application

Name + icon

Security Risk

Example:

78 / 100

Privacy Risk

Example:

72 / 100

Permissions

Show important permissions in human-readable language.

Example:

Location → High

Microphone → Medium

Camera → Medium

Contacts → High

Internet → High

Files → Medium

Do not automatically call an application malicious merely because it requests permissions.

Explain:

Why does this matter?

Is this unusual?

What should the user review?

Provide technical details behind an expandable section.

9. PRIVACY RADAR

Create a dedicated Privacy Radar screen.

Show:

Privacy Score: 72/100

Break down areas such as:

Location

Camera

Microphone

Contacts

SMS

Phone/call-related permissions

Files/media

Network access

Background activity where observable

Sensitive permissions

Show which applications contribute most to the risk.

Example:

3 applications need attention

Provide:

Review Apps

Do not claim to observe behavior that Android does not expose to third-party applications.

10. TRACKER INTELLIGENCE

Implement tracker identification where technically possible.

Detect known:

Advertising SDKs

Analytics SDKs

Tracking domains

Known tracker endpoints

Integrate tracker information with DNS protection where appropriate.

Display:

41 trackers blocked today

Also allow:

View Tracker Details

Do not claim a tracker is malicious solely because it is an analytics/advertising service.

Distinguish:

Tracker

Advertisement

Analytics

Malicious

Unknown

11. NETWORK PROTECTION

Rebuild the existing NetworkControlScreen.

The existing VPN backend should be preserved if it works.

The UI must provide:

VPN Protection

ON/OFF

DNS Protection

ON/OFF

Threat Protection

ON/OFF

Tracker Blocking

ON/OFF

Advertisement Blocking

ON/OFF

Show:

Domains blocked

Trackers blocked

Threats blocked

Network events

The UI must reflect actual VPN state.

Never show "Protected" when the VPN is disconnected.

12. DNS PROTECTION

Implement real DNS/domain filtering.

Use reputable public blocklists where licensing and technical constraints permit.

Support:

Malicious domains

Phishing domains

Trackers

Advertising domains

Also support:

Custom Blocklist

User can add domains.

Allowlist

User can allow specific domains.

Domain History

Show:

Domain

Category

Blocked/allowed

Timestamp where available

Example:

malicious-example.com

Blocked

Reason:

Threat intelligence / malicious-domain list

Do not falsely label unknown domains as malicious.

13. NETWORK SECURITY

Add:

Wi-Fi Security

Detect and explain:

Open networks

Public networks

Network changes

Security configuration where Android exposes it

Suspicious DNS configuration where technically determinable

Example:

⚠ Public Wi-Fi

Explain the risk.

Do not claim that every public Wi-Fi network is malicious.

14. REAL-TIME MONITORING

Create a central monitoring engine.

Monitor events that Android legitimately allows the application to detect.

Examples:

New application installed

Show:

New App Detected

Risk:

Low / Medium / High

Actions:

Review

Application updated

If relevant security/permission metadata changed, create an event.

Security configuration changed

Example:

USB debugging enabled.

VPN disconnected

Show immediate warning where technically possible.

Accessibility service changed

Warn when relevant accessibility configuration changes are detectable.

Device administrator/device policy changes

Monitor where Android APIs permit.

Never claim monitoring capabilities that Android prevents.

15. SECURITY EVENT TIMELINE

Create a Security Activity screen.

Show chronological events:

Example:

5:42 PM

New app installed

Unknown App

Risk: High

4:18 PM

Permission/security configuration changed

Application X

3:51 PM

Threat blocked

example-domain.com

2:20 PM

Tracker blocked

tracker.example.com

Use severity indicators.

Allow filtering:

All

Threats

Apps

Privacy

Network

Device

16. SECURITY ACTION CENTER

Create a dedicated action-oriented system.

Instead of only reporting problems, show:

Fix Now

Example:

Unknown app installation enabled

Why it matters

Applications can be installed from outside trusted sources.

[ Review Setting ]

High-risk application

[ Review App ]

VPN protection disabled

[ Enable Protection ]

Every recommendation should have:

Problem

Explanation

Risk

Recommended action

Fix/review button when possible

17. SECURITY HISTORY

Store appropriate local security history.

Display:

Security score over time

Threat events

App changes

Permission changes

Network blocks

Security configuration changes

Allow:

Today

7 days

30 days

All

Do not collect unnecessary personal data.

18. MALWARE / THREAT INTELLIGENCE

This is an advanced phase.

Design the architecture so it can later support:

Malware signatures

File hashes

Reputation checks

Threat intelligence APIs

Suspicious APK analysis

Malicious-domain intelligence

Phishing intelligence

Threat database updates

Threat history

False-positive handling

Do not claim malware detection unless the application actually has a reliable detection source.

Use clear categories:

Confirmed malicious

Known threat

Suspicious

Potentially risky

Unknown

Safe/known good

Do not use AI alone to determine malware.

19. ADVANCED NETWORK ANALYSIS

Architect for future expansion.

Potential future functionality:

Domain-level traffic classification

Connection history

Suspicious destination detection

Tracker identification

Malicious destination blocking

Per-app network statistics where technically available

Network security events

Do not implement fake packet inspection.

Do not claim to decrypt HTTPS traffic unless this is genuinely implemented, technically justified, and compliant with platform and privacy requirements.

Prioritize DNS/domain-level protection first.

20. ADVANCED ANDROID PROTECTION

Support stronger Android security capabilities only when technically and policy appropriate.

Potential features:

Device Administrator monitoring

Device Policy integration

Device-owner/managed-device mode

Accessibility-service monitoring

Notification-access monitoring

Overlay-risk monitoring

Unknown-app installation monitoring

VPN monitoring

Security-setting monitoring

IMPORTANT:

Do not require Device Administrator permission for normal consumer functionality simply to make the application appear more powerful.

Use:

Consumer Mode

Minimal permissions.

Managed/Enterprise Mode

Advanced device-management capabilities where appropriate.

21. AI SECURITY ASSISTANT

Add an AI Security Assistant.

Users can ask:

Why is my security score low?

Why is this app risky?

What does this permission mean?

Why was this domain blocked?

What should I fix first?

What happened today?

Give me a weekly security report.

Is this application suspicious?

The AI must use actual application/device security data as context.

Example:

User:

"Why is my score 68?"

Assistant:

"Your score decreased because two applications were installed outside Google Play and one application has accessibility access. I recommend reviewing those applications first."

AI must explain evidence.

AI must not invent device information.

AI must not independently declare malware without trusted evidence.

22. AI SECURITY REPORT

Allow:

Generate Security Report

Report sections:

Overall score

Major risks

App risks

Privacy risks

Network protection

Recent events

Recommended actions

Allow:

Weekly Security Summary

23. FAMILY PROTECTION — FUTURE

Architect the application so family features can be added later.

Potential features:

Family account

Multiple devices

Central dashboard

Device status

Shared DNS policies

Shared blocklists

App-risk alerts

New-app alerts

Security reports

Parent/child profiles

Device synchronization

This requires backend infrastructure.

Do not build this before the standalone consumer product is validated.

24. ACCOUNT / CLOUD ARCHITECTURE — FUTURE

Prepare for:

Authentication

User accounts

Device registration

Secure synchronization

Cloud configuration

Subscription status

Family device management

Keep security-sensitive data local whenever practical.

Follow data minimization.

25. PREMIUM MONETIZATION

Design the UI so premium features can be introduced without damaging the free experience.

FREE

Basic security scan

Security score

App inventory

Basic hardening report

Basic privacy analysis

Basic recommendations

PRO

Target pricing:

₹99–₹149/month

or

₹799–₹1,499/year

Potential Pro features:

Continuous monitoring

DNS protection

Tracker blocking

Advanced app analysis

Permission-change alerts

New-app alerts

Wi-Fi protection

Advanced privacy reports

Security history

Advanced blocklists

AI Security Assistant

FAMILY

Target:

₹1,499–₹2,499/year

Potential features:

Multiple devices

Family dashboard

Shared policies

DNS protection

Family alerts

Cross-device reports

Do not hard-code pricing. Make pricing configurable.

26. HOME SCREEN UX

The home screen should visually prioritize:

Security score

Protection status

Problems requiring attention

Recent security activity

Quick actions

Example structure:

SECURITY SCORE

87 / 100

🟢 Protected

Protection:

✓ VPN Protection

✓ DNS Protection

✓ App Monitoring

✓ Tracker Blocking

2 Things Need Attention

⚠ High-risk app detected

⚠ Public Wi-Fi

[Review Security]

Today

23 threats blocked

41 trackers blocked

2 security changes

27. APP SCREEN UX

Use:

Search

Filters:

All | Risky | New | Sideloaded | Unused

Each application card:

Icon

Application name

Security Risk

Privacy Risk

Important warning if applicable

Tap → App Detail.

28. NETWORK SCREEN UX

Show one prominent protection state:

🟢 PROTECTED

VPN Protection: ON

DNS Protection: ON

Threat Blocking: ON

Tracker Blocking: ON

Then:

Threats blocked today

Trackers blocked today

Domains blocked today

Buttons:

Manage Protection

Blocklists

Network History

29. PRIVACY SCREEN UX

Show:

PRIVACY RADAR

72 / 100

Then categories:

Location

Microphone

Camera

Contacts

Files

Network

Background access where available

Then:

Apps Needing Attention

List the highest-risk applications.

30. SETTINGS

Include:

Protection settings

DNS settings

Blocklists

Allowlist

Notifications

Monitoring settings

Scan settings

Privacy settings

AI settings

Battery optimization guidance

Data management

Security history

Subscription

Account

Family

About

Help

Privacy Policy

Terms

Export/delete local data where appropriate

31. PERFORMANCE REQUIREMENTS

Security must not destroy the user's battery.

Optimize for:

Low background CPU usage

Low memory usage

Efficient event processing

Efficient DNS filtering

Minimal unnecessary network calls

Local caching

Offline functionality where practical

Do not run expensive scans continuously.

Use Android-recommended background mechanisms.

32. PRIVACY REQUIREMENTS

The app itself must be privacy-first.

Principles:

Collect minimum data

Prefer local processing

Do not sell user data

Do not collect unnecessary browsing history

Clearly disclose network/security functionality

Clearly disclose permissions

Provide data deletion mechanisms where applicable

Secure any cloud data

Never send sensitive data to an AI service unnecessarily

The security application must not become a privacy problem itself.

33. ERROR STATES

Design proper UI for:

VPN permission denied

VPN failed to start

VPN disconnected

No apps detected

Scan failed

Network unavailable

DNS failure

Blocklist unavailable

Threat intelligence unavailable

Permission unavailable

Android version limitation

Feature unavailable on device

Battery optimization restrictions

Never display fake success.

34. EMPTY STATES

Every screen must have a useful empty state.

Examples:

"No security events yet."

"No risky apps detected."

"No trackers blocked today."

"No custom blocklist domains."

"No family devices connected."

Explain what the empty state means.

35. ACCESSIBILITY

Support:

Screen readers

Large fonts

Dynamic text sizing

Good contrast

Touch targets

Meaningful content descriptions

Color-independent status indicators

Never communicate security state using color alone.

36. SECURITY SCORE ENGINE

Create a transparent scoring model.

Possible categories:

Device security

App security

Privacy

Network protection

Monitoring

Configuration

Each category contributes to the overall score.

Show:

Why did my score change?

The user must be able to understand the major reasons.

Avoid arbitrary scores.

37. DEVELOPMENT ORDER

Do NOT attempt to implement everything at once.

Implement in this exact order:

Phase 1

Fix manifest

Fix blank screen

Verify real installed-app inventory

Rebuild NetworkControlScreen

Connect getHardeningReport()

Build Home/Security Center

Build Security Score

Build App screen

Build Hardening screen

Phase 2

DNS filtering

Blocklists

Allowlist

Network history

New-app monitoring

Permission-change monitoring

Real-time alerts

Security Activity timeline

Phase 3

Privacy Radar

App privacy score

Tracker detection

Sideload detection

Wi-Fi security

Security Action Center

Security history

Phase 4

Threat intelligence architecture

Malware/reputation integration

Advanced network analysis

AI Security Assistant

AI reports

Phase 5

Accounts

Backend

Subscriptions

Family protection

Cross-device synchronization

38. CRITICAL DEVELOPMENT RULE

Before implementing any feature:

Inspect the existing project.

Identify what already works.

Do not duplicate existing functionality.

Preserve working backend/security logic.

Implement UI around real functionality.

Build one feature at a time.

Compile.

Run tests.

Install on a real Android device.

Verify the actual behavior.

Only then move to the next feature.

If a feature cannot actually be implemented because Android restricts it, do not fake it.

Instead:

explain the limitation

implement the closest legitimate capability

show the limitation clearly in the UI

39. FINAL PRODUCT GOAL

The final application should feel like:

A complete Android Security & Privacy Center

not:

A collection of disconnected security tools.

The user should be able to open the application and immediately understand:

"Am I protected?"

"What changed?"

"What is risky?"

"What can I fix?"

"What is being blocked?"

"Why is it risky?"

"What should I do next?"

The final product should combine:

Device Security + App Intelligence + Privacy Radar + DNS Protection + Network Security + Continuous Monitoring + Security History + AI Explanation

with Family Protection and advanced threat intelligence as future expansion.

Do not sacrifice reliability, privacy, Android compatibility, battery life, or Google Play compliance just to increase the feature count.

Build a smaller number of features extremely well before expanding the platform.

