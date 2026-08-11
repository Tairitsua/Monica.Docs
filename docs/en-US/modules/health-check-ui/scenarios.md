---
title: Scenarios
description: Use the Health Check dashboard safely during development and operations.
sidebar_position: 5
---

## Scenario 1 — Diagnose local readiness

Open `/health-checks`, inspect the readiness banner, then filter by the `ready` tag. The detail drawer shows the selected registration's description, duration, tags, bounded data, and bounded exception summary.

## Scenario 2 — Share one diagnostics policy

An internal operations host can use the same named policy for Module System, Health Check, and Seeder pages. Configure each page explicitly; one page's enablement never authorizes another page implicitly.

## Scenario 3 — Preserve evidence during a temporary outage

If a refresh cannot execute, the last successful snapshot remains visible and the page reports that it is stale. This is evidence from the current process, not proof that the old state still holds. Use the timestamp and refresh warning together.

## Scenario 4 — Monitor a fleet

Use the anonymous probe endpoints for orchestrator decisions and export health status through your monitoring platform for fleet-wide retention. The built-in page intentionally represents only the host serving the current circuit.

## Common mistakes

- Exposing the dashboard outside Development without a registered authorization policy.
- Assuming dashboard authorization also protects `/health` or `/alive`.
- Treating the page as durable incident history.
- Expecting the UI to register application-specific checks.
