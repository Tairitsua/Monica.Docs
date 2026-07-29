---
title: Quick Start
description: Register Execution Timing and measure work in a Generic or Web Host.
sidebar_position: 2
---

# Quick Start

## Install the package

```bash
dotnet add package Monica.Profiling --prerelease
```

## Measure work in a Generic Host

The default background-batch mode works in `Host.CreateApplicationBuilder(...)`. No Web application or endpoint mapping is required.

```csharp
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Monica.Core.Modularity.Extensions;
using Monica.Modules;
using Monica.Profiling.ExecutionTiming.Abstractions;

var builder = Host.CreateApplicationBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddExecutionTiming();
});

using var host = builder.Build();
await host.StartAsync();

var timingFactory = host.Services.GetRequiredService<IExecutionTimingFactory>();
var timingQuery = host.Services.GetRequiredService<IExecutionTimingQuery>();

using (timingFactory.BeginScope("orders.import", "Import pending orders"))
{
    await Task.Delay(25);
}

var statistics = timingQuery.GetStatistics("orders.import");
Console.WriteLine(
    $"{statistics?.DisplayName}: {statistics?.ExecutionCount} samples, " +
    $"{statistics?.AverageDurationMs:0.##} ms average");

await host.StopAsync();
```

`BeginScope(...)` starts immediately and records the sample when disposed. In background mode, the public statistics query drains pending samples before returning, so this read observes the completed scope.

## Enable Web diagnostic endpoints

Web hosts use the same module. Set `EnableMinimalApi` to `true`, then complete the normal Monica Web composition with `UseMonica()` followed by `MapMonica()`.

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddExecutionTiming(options =>
    {
        options.EnableMinimalApi = true;
    });
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

This maps:

```text
GET /execution-timing/statistics
GET /execution-timing/running
```

The first route returns completed aggregates ordered by average duration. The second returns active invocations ordered by current elapsed duration.

## Automatic business-operation timing

`AddExecutionTiming()` also contributes a diagnostics behavior to the [Execution Pipeline](../execution-pipeline/index.md). Every native Monica adapter whose descriptor is marked as a business operation is timed automatically. You do not need to wrap those operations in another manual scope.

## What to read next

- [Configuration](./configuration.md) explains aggregation and endpoint defaults.
- [Guide and Runtime APIs](./guide-and-providers.md) documents the factory and query contracts.
- [Scenarios](./scenarios.md) covers reusable recorders and operational diagnostics.
