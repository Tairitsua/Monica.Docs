---
title: Health Check
description: Publish stable liveness and readiness probes and inspect sanitized current-host results.
sidebar_position: 1
---

`Monica.HealthCheck` composes ASP.NET Core health checks into one host-owned operational contract. It maps lightweight liveness and readiness probes, contributes a built-in process check, and exposes sanitized point-in-time snapshots through `HealthCheckFacade`.

```bash
dotnet add package Monica.HealthCheck --prerelease
```

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddHealthCheck();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

The default endpoints are:

| Probe | Path | Included registrations | Meaning |
|---|---|---|---|
| Readiness | `/health` | Checks tagged `ready` | Whether this instance should receive workload traffic. |
| Liveness | `/alive` | Checks tagged `live` | Whether the process is responsive and should remain running. |

The module always adds `monica.self` with `live`, `ready`, and `monica` tags. Probe endpoints are mapped in every web environment and are anonymous by design so orchestrators can evaluate the process before application authentication is available. Register the runtime module and readiness checks independently of Development-only Aspire services or diagnostics pages.

Probe responses are deliberately small: `Healthy`, `Degraded`, or `Unhealthy`. Healthy and degraded reports return HTTP 200; unhealthy reports return HTTP 503. Detailed, bounded evidence is available through the facade and the optional [Health Check UI](../health-check-ui/index.md), not through the anonymous probe body.

## Public surface

- `AddHealthCheck(...)` registers the runtime, facade, built-in self check, and optional endpoints.
- `AddMonicaLivenessCheck<THealthCheck>(...)` adds the stable `live` and `monica` tags.
- `AddMonicaReadinessCheck<THealthCheck>(...)` adds the stable `ready` and `monica` tags.
- `HealthCheckFacade.GetSnapshotAsync(...)` executes `All`, `Readiness`, or `Liveness` registrations and returns a sanitized `Res<HealthCheckSnapshot>`.
- `HealthCheckTags` exposes the stable `live`, `ready`, and `monica` tag names.

## Next steps

- [Quick start](./quick-start.md)
- [Configuration](./configuration.md)
- [Registration extensions and diagnostics](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [Diagnostics and operations surfaces](../../scenarios/diagnostics-and-ops.md)
