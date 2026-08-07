---
title: Scenarios
description: Apply Execution Timing to workers, reusable operations, pipeline boundaries, and Web diagnostics.
sidebar_position: 5
---

## Scenario 1 — Time work in a worker

Register Execution Timing in a Generic Host and inject `IExecutionTimingFactory` into the worker. Use `BeginScope(...)` when one `using` block represents the complete operation:

```csharp
using Microsoft.Extensions.Hosting;
using Monica.Profiling.ExecutionTiming.Abstractions;

public sealed class ImportWorker(IExecutionTimingFactory timingFactory)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using (timingFactory.BeginScope("imports.orders", "Import orders"))
            {
                await ImportOrdersAsync(stoppingToken);
            }
        }
    }

    private static Task ImportOrdersAsync(CancellationToken cancellationToken)
        => Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);
}
```

Generic Hosts expose no Execution Timing HTTP routes. Query `IExecutionTimingQuery` from application code or export its snapshots through an application-owned interface.

## Scenario 2 — Reuse one recorder for repeated samples

Use `CreateRecorder(...)` when an application component owns one stable operation and explicitly controls each sample:

```csharp
using Monica.Profiling.ExecutionTiming.Abstractions;

public sealed class BatchProcessor : IDisposable
{
    private readonly IExecutionTimingRecorder _recorder;

    public BatchProcessor(IExecutionTimingFactory timingFactory)
    {
        _recorder = timingFactory.CreateRecorder(
            "batches.process",
            "Process one queued batch");
    }

    public async Task ProcessAsync(CancellationToken cancellationToken)
    {
        _recorder.Start();
        try
        {
            await Task.Delay(20, cancellationToken);
        }
        finally
        {
            _recorder.Stop();
        }
    }

    public void Dispose() => _recorder.Dispose();
}
```

Use a `finally` block so failed and cancelled attempts still complete their timing sample. Do not invoke the same mutable recorder concurrently.

## Scenario 3 — Measure Monica business operations automatically

`AddExecutionTiming()` registers its execution behavior without requiring application code to wrap Mediator, EventBus, job, seeder, hosted-work, or direct MVC operations. The owning adapter decides whether a descriptor is a business operation; Execution Timing uses that stable metadata.

Use the [Execution Pipeline runtime catalog](../execution-pipeline/index.md) when you need to verify whether `ExecutionTimingBehavior<,>` applies to a particular observed plan and where it appears in the ordered behavior chain.

## Scenario 4 — Expose Web diagnostics deliberately

Enable the two read-only routes only on hosts where host-local diagnostics should be reachable:

```csharp
builder.AddMonica(monica =>
{
    monica.AddExecutionTiming(options => options.EnableMinimalApi = true)
        .UseBackgroundBatchAggregation(TimeSpan.FromMilliseconds(500));
});
```

The module provides the route payloads but does not replace application authorization, network binding, or operational access policy. Keep diagnostics private unless the application deliberately secures and publishes them.

## Common mistakes

- Expecting `EnableMinimalApi = true` to map routes in a Generic Host.
- Forgetting `app.UseMonica()` followed by `app.MapMonica()` in a Web Host.
- Using unstable or value-derived operation keys, which fragments aggregate statistics.
- Choosing inline aggregation for a very hot path without accepting caller-thread update cost.
- Disposing a recorder returned by `CreateRecorder(...)` without calling `Stop()` first.
- Sharing one reusable recorder across concurrent operations; use separate `BeginScope(...)` calls or explicit invocation IDs instead.
- Enabling obsolete thread-local memory tracking for async work.
