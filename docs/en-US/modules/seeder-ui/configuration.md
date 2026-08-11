---
title: Configuration
description: Configure dashboard exposure, polling, stale evidence, and current-host lifetime.
sidebar_position: 3
---

## Access options

| Property | Type | Default | Required | Purpose |
|---|---|---:|---:|---|
| `ModuleShellUIOption.OperationalPageAccess.AuthorizationPolicy` | `string?` | `null` | No | Sets the policy inherited by Monica operational pages outside Development. |
| `ModuleShellUIOption.OperationalPageAccess.DebugMode` | `bool` | `false` | No | Bypasses operational-page authorization in every environment. |
| `ModuleSeederUIOption.AuthorizationPolicyOverride` | `string?` | `null` | No | Replaces the global policy for `/seeders`; blank values inherit the global policy. |

Access uses this precedence: global Debug mode, Development access, the page override, and then the global policy. Outside Development, a missing effective policy, missing authorization service, unknown policy, exception, or denied user fails closed before the facade is invoked.

| Environment | Debug mode | Effective policy | Result |
|---|---:|---|---|
| Development | `false` | Any | Available without policy evaluation. |
| Any | `true` | Ignored | Available without policy evaluation. |
| Non-Development | `false` | Missing, unknown, or denied | Access denied; facade is not invoked. |
| Non-Development | `false` | Registered and satisfied | Available. |

`OperationalPageAccess.DebugMode` is independent from `ModuleShellUIOption.EnableDebug`. The former bypasses authorization; the latter exposes detailed Blazor and SignalR errors. Keep both disabled on production-reachable hosts unless the host is intentionally isolated and the disclosure risk is accepted.

## Session behavior

- Initial load and manual refresh call `SeederFacade.GetSnapshotAsync(...)`.
- Active states (`Waiting`, `Running`, `Aborting`) poll every second.
- Terminal states stop automatic polling.
- Concurrent callers join the active refresh instead of duplicating facade requests.
- A failed refresh preserves the last successful snapshot and reports that evidence as stale.
- Authorization is re-evaluated before every facade boundary.
- Selection is tracked by stable full type name across refreshed immutable rows.
- Leaving the page cancels the timer, active request, and owned UI work deterministically.

The page does not configure the scheduler. Use `ModuleSeederOption` and `[SeederPolicy]` in the runtime module for execution behavior.
