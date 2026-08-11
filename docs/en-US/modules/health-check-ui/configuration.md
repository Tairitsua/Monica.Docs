---
title: Configuration
description: Configure dashboard exposure and understand its refresh lifetime.
sidebar_position: 3
---

## Module options

| Property | Default | Purpose |
|---|---:|---|
| `EnableOutsideDevelopment` | `false` | Allows the page to be considered outside Development. |
| `AuthorizationPolicy` | `null` | Names the host policy evaluated for the current Blazor circuit outside Development. |

Setting `EnableOutsideDevelopment` without a non-empty policy name fails module validation in every environment. Outside Development, a name alone is not sufficient: the host must register the policy, and the current user must satisfy it.

| Environment | Enable flag | Valid policy | Result |
|---|---:|---:|---|
| Development | `false` (default) | Not required | Available. |
| Development | `true` | Non-empty name required for validation | Available; policy enforcement begins outside Development. |
| Non-Development | `false` | Any | Disabled. |
| Non-Development | `true` | Missing or denied | Access denied; facade is not invoked. |
| Non-Development | `true` | Registered and satisfied | Available. |

## Refresh behavior

- The first request shows a dedicated loading or failure state.
- A page-owned timer refreshes the `All` snapshot every ten seconds.
- Manual and timer refreshes join the same in-flight request.
- An older snapshot remains visible when a refresh fails.
- Authorization is checked again immediately before every facade call.
- Leaving the page cancels the timer and drains owned work deterministically.

The dashboard has no fleet aggregation or durable timeline. Every refresh executes checks on the host serving the current Blazor circuit.
