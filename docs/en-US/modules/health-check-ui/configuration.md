---
title: Configuration
description: Configure dashboard exposure and understand its refresh lifetime.
sidebar_position: 3
---

## Access options

| Property | Type | Default | Required | Purpose |
|---|---|---:|---:|---|
| `ModuleShellUIOption.OperationalPageAccess.AuthorizationPolicy` | `string?` | `null` | No | Sets the policy inherited by Monica operational pages outside Development. |
| `ModuleShellUIOption.OperationalPageAccess.DebugMode` | `bool` | `false` | No | Bypasses operational-page authorization in every environment. |
| `ModuleHealthCheckUIOption.AuthorizationPolicyOverride` | `string?` | `null` | No | Replaces the global policy for `/health-checks`; blank values inherit the global policy. |

Access uses this precedence: global Debug mode, Development access, the page override, and then the global policy. Outside Development, a missing effective policy, missing authorization service, unknown policy, exception, or denied user fails closed before the facade is invoked.

| Environment | Debug mode | Effective policy | Result |
|---|---:|---|---|
| Development | `false` | Any | Available without policy evaluation. |
| Any | `true` | Ignored | Available without policy evaluation. |
| Non-Development | `false` | Missing, unknown, or denied | Access denied; facade is not invoked. |
| Non-Development | `false` | Registered and satisfied | Available. |

`OperationalPageAccess.DebugMode` is independent from `ModuleShellUIOption.EnableDebug`. The former bypasses authorization; the latter exposes detailed Blazor and SignalR errors. Keep both disabled on production-reachable hosts unless the host is intentionally isolated and the disclosure risk is accepted.

## Refresh behavior

- The first request shows a dedicated loading or failure state.
- A page-owned timer refreshes the `All` snapshot every ten seconds.
- Manual and timer refreshes join the same in-flight request.
- An older snapshot remains visible when a refresh fails.
- Authorization is checked again immediately before every facade call.
- Leaving the page cancels the timer and drains owned work deterministically.

The dashboard has no fleet aggregation or durable timeline. Every refresh executes checks on the host serving the current Blazor circuit.
