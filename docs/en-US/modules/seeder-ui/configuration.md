---
title: Configuration
description: Configure dashboard exposure, polling, stale evidence, and current-host lifetime.
sidebar_position: 3
---

## Module options

| Property | Default | Purpose |
|---|---:|---|
| `EnableOutsideDevelopment` | `false` | Allows the page to be considered outside Development. |
| `AuthorizationPolicy` | `null` | Names the host policy evaluated for the current Blazor circuit outside Development. |

Setting `EnableOutsideDevelopment` without a non-empty policy name fails module validation in every environment. Outside Development, the named policy must also be registered and satisfied by the current user.

| Environment | Enable flag | Valid policy | Result |
|---|---:|---:|---|
| Development | `false` (default) | Not required | Available. |
| Development | `true` | Non-empty name required for validation | Available; policy enforcement begins outside Development. |
| Non-Development | `false` | Any | Disabled. |
| Non-Development | `true` | Missing or denied | Access denied; facade is not invoked. |
| Non-Development | `true` | Registered and satisfied | Available. |

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
