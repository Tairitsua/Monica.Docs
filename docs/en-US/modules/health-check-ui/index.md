---
title: Health Check UI
description: Inspect readiness and sanitized health-check evidence in Monica's shared operations shell.
sidebar_position: 1
---

`Monica.HealthCheck.UI` adds a read-only dashboard at `/health-checks`. It consumes the sanitized [Health Check](../health-check/index.md) facade for the current host; it does not replace `/health` or `/alive`, persist history, or change check registrations.

The page provides:

- current-host identity, readiness state, aggregate counts, check time, and duration;
- name/description search plus status and tag filters;
- a dense table of status, description, duration, and tags; and
- a detail drawer for bounded diagnostic data and bounded exception evidence.

The page refreshes every ten seconds and supports manual refresh. Concurrent refresh requests join one in-flight facade call. If a later refresh fails, the previous snapshot stays visible with a warning. Access is re-evaluated before every facade request, and the page-owned session cancels and drains its work when disposed.

## Access contract

The dashboard is available by default in Development. Outside Development it remains disabled unless the host both enables it and supplies a valid named authorization policy. A missing, unregistered, or denied policy prevents navigation and facade access.

## Next steps

- [Quick start](./quick-start.md)
- [Configuration](./configuration.md)
- [Registration and access boundary](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [Diagnostics and operations surfaces](../../scenarios/diagnostics-and-ops.md)
