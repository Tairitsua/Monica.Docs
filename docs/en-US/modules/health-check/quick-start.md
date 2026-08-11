---
title: Quick start
description: Register host probes and classify application checks as liveness or readiness.
sidebar_position: 2
---

## Install

```bash
dotnet add package Monica.HealthCheck --prerelease
```

## Register the runtime in every environment

```csharp
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Monica.Core.Modularity.Extensions;
using Monica.HealthCheck.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHealthChecks()
    .AddMonicaLivenessCheck<ProcessLoopHealthCheck>("orders.process-loop")
    .AddMonicaReadinessCheck<OrderDatabaseHealthCheck>(
        "orders.database",
        failureStatus: HealthStatus.Unhealthy,
        timeout: TimeSpan.FromSeconds(3));

builder.AddMonica(monica =>
{
    monica.AddHealthCheck();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();

public sealed class ProcessLoopHealthCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default) =>
        Task.FromResult(HealthCheckResult.Healthy());
}

public sealed class OrderDatabaseHealthCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default) =>
        Task.FromResult(HealthCheckResult.Healthy());
}
```

Keep `AddHealthCheck()` and application readiness registrations outside conditions that only run in Development or when Aspire is enabled. Aspire service defaults may contribute additional checks, but they do not replace the host's production readiness contract.

## Verify the probes

```bash
curl -i http://localhost:5000/alive
curl -i http://localhost:5000/health
```

Use liveness only for evidence that determines whether the process should be restarted. Put dependencies needed to accept traffic—database connectivity, required startup work, or mandatory external services—in readiness. Avoid placing every downstream dependency in liveness, because a temporary dependency outage can otherwise create a restart loop.
