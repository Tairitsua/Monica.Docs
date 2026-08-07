---
title: Configuration
description: Configure Execution Timing aggregation, flush cadence, and Web endpoints.
sidebar_position: 3
---

## Module options

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `AggregationMode` | `ExecutionTimingAggregationMode` | `BackgroundBatch` | No | Use `Inline` when completed statistics must be updated synchronously on the caller thread. | Background mode reduces hot-path write work and composes the HostedService module. |
| `BackgroundFlushInterval` | `TimeSpan` | `250 ms` | No | Adjust the latency/overhead balance for frequent samples. | Used only in `BackgroundBatch`; non-positive values fall back to `250 ms`. |
| `EnableMinimalApi` | `bool?` | `null` | No | Set to `true` or `false` to override the host-wide endpoint policy for this module. | When `null`, follows `EnableMinimalApiByDefault`, whose framework default is `false`. Has no effect in a Generic Host. |
| `ApiGroup` | `string?` | `null` | No | Override the endpoint tag/group name in a Web Host. | Falls back to the module-system default group, then `ModuleExecutionTiming`. |

`EnableMinimalApi` is the only Execution Timing endpoint switch. There is no separate execution-timing endpoint option.

## Aggregation modes

| Mode | Completion path | Query behavior | Recommended use |
|---|---|---|---|
| `BackgroundBatch` | Enqueues a completed sample; a hosted coordinator periodically applies queued samples. | Statistics queries drain pending samples before returning. | Default for frequent production measurements. |
| `Inline` | Applies the completed sample synchronously on the caller thread. | Statistics are immediately present without a queue flush. | Deterministic immediate visibility or hosts that want no batching service. |

Both modes register active invocations immediately, remove them when completed, and expose the same `IExecutionTimingFactory` and `IExecutionTimingQuery` contracts.

## Configure options directly

```csharp
using Microsoft.Extensions.Hosting;
using Monica.Core.Modularity.Extensions;
using Monica.Modules;
using Monica.Profiling.ExecutionTiming.Models;

var builder = Host.CreateApplicationBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddExecutionTiming(options =>
    {
        options.AggregationMode = ExecutionTimingAggregationMode.BackgroundBatch;
        options.BackgroundFlushInterval = TimeSpan.FromMilliseconds(500);
    });
});

using var host = builder.Build();
await host.RunAsync();
```

Prefer the registration extensions when selecting a standard aggregation mode. Direct option assignment remains useful when configuration code sets several module properties together.

## Endpoint behavior

For an ASP.NET Core host with Minimal APIs enabled, `MapMonica()` maps:

| Method | Route | Result |
|---|---|---|
| `GET` | `/execution-timing/statistics` | Completed statistics sorted by average duration, display name, and operation key. |
| `GET` | `/execution-timing/running` | Active invocations sorted by current elapsed duration, display name, and invocation ID. |

Generic Hosts retain collection, aggregation, and query capabilities but never map these endpoints. Setting `EnableMinimalApi = true` does not turn a Generic Host into a Web Host.

## Recorder settings

Each `IExecutionTimingRecorder` has two optional per-recorder properties:

| Property | Default | Behavior |
|---|---|---|
| `EnableLogging` | `false` | Logs an information message when a sample completes. |
| `Description` | `null` | Adds display context to running-operation diagnostics and logs. |

`EnableMemoryTracking` is obsolete because its thread-local allocation measurement can become inaccurate after asynchronous continuation switches. Do not use it as a production memory metric.
