---
title: Registration extensions and diagnostics
description: Register consistently tagged checks and consume sanitized health snapshots.
sidebar_position: 4
---

## Registration extensions

| Method | Tags added automatically | Typical use |
|---|---|---|
| `monica.AddHealthCheck(...)` | Adds built-in `monica.self` with `live`, `ready`, and `monica`. | Own the host probe endpoints and diagnostics facade. |
| `AddMonicaLivenessCheck<T>(...)` | `live`, `monica` | Process-loop or runtime responsiveness evidence. |
| `AddMonicaReadinessCheck<T>(...)` | `ready`, `monica` | Dependencies and startup work required before accepting traffic. |

Both typed helpers accept an optional failure status, additional tags, and timeout. Blank additional tags are ignored and duplicates are normalized case-insensitively.

The Health Check module uses the native `IHealthCheck` and `IHealthChecksBuilder` contracts; there is no Monica-specific provider abstraction to select. Existing ASP.NET Core checks can coexist with Monica registrations. Only checks carrying the appropriate stable tag participate in the corresponding probe.

## Query the current host

Inject `HealthCheckFacade` at an application or UI boundary:

```csharp
using Monica.HealthCheck.Facades;
using Monica.HealthCheck.Models;

public sealed class OperationsSummary(HealthCheckFacade healthChecks)
{
    public async Task<HealthCheckSnapshot?> GetReadinessAsync(
        CancellationToken cancellationToken)
    {
        var result = await healthChecks.GetSnapshotAsync(
            HealthCheckScope.Readiness,
            cancellationToken);

        return result.IsFailed(out _, out var snapshot) ? null : snapshot;
    }
}
```

`HealthCheckScope.All` executes every registration, while `Readiness` and `Liveness` select their stable tags. Snapshot capture is point-in-time and host-local; the runtime module does not create durable history or aggregate multiple instances.

For an operator-facing view, register the separate [Health Check UI](../health-check-ui/index.md). Protect that UI independently; do not add authentication requirements to the anonymous platform probes.
