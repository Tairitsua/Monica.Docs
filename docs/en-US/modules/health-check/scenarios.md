---
title: Scenarios
description: Apply liveness, readiness, and sanitized diagnostics in common deployments.
sidebar_position: 5
---

## Scenario 1 — Kubernetes or another orchestrator

Point the platform's liveness probe at `/alive` and readiness probe at `/health`. Liveness decides whether the process should be restarted; readiness decides whether this instance receives traffic. A degraded result remains HTTP 200, so use `Unhealthy` when the platform must remove the instance from service.

## Scenario 2 — Keep readiness independent from debug services

Register `monica.AddHealthCheck()` and the checks needed by the application in the common composition path. If Development additionally calls `builder.AddServiceDefaults()` for Aspire, treat those registrations as additive. Production must not lose its database, Seeder, scheduler, or other module readiness checks merely because debug-only Aspire services are absent.

## Scenario 3 — Inspect one host without exposing raw exceptions

Use `HealthCheckFacade.GetSnapshotAsync(HealthCheckScope.All, ...)` or the protected dashboard. The snapshot retains names, tags, timing, bounded diagnostic data, and bounded error summaries while omitting stack traces and redacting credential-like values.

## Scenario 4 — Classify a dependency correctly

A database required for serving requests belongs in readiness. A background integration whose outage reduces capability but does not prevent all traffic can return `Degraded`. A remote dependency generally does not belong in liveness: restarting a healthy process rarely repairs the remote system.

## Common mistakes

- Registering Health Check only inside a Development or Aspire condition.
- Using the same path for liveness and readiness.
- Treating `Degraded` as HTTP 503; Monica intentionally maps it to 200.
- Returning secrets in diagnostic keys that do not communicate their sensitivity.
- Using the current-host facade as durable or fleet-wide monitoring storage.
