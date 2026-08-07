---
title: Registration Extensions and Runtime APIs
description: Select an aggregation mode and use the public Execution Timing recording and query contracts.
sidebar_position: 4
---

Execution Timing has no replaceable provider. Its registration extensions select one of two built-in aggregation coordinators, while applications interact with host-neutral factory and query abstractions.

## Registration extensions

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `UseInlineAggregation()` | Applies each completed sample synchronously on the caller thread. | No | Tests, low-volume measurements, or deterministic immediate aggregation. |
| `UseBackgroundBatchAggregation(TimeSpan? flushInterval = null)` | Queues completed samples and aggregates them in a Monica background service. | No | Production workloads with frequent timing samples. |

The default is background batching with the option's `250 ms` flush interval.

```csharp
builder.AddMonica(monica =>
{
    monica.AddExecutionTiming()
        .UseBackgroundBatchAggregation(TimeSpan.FromSeconds(1));
});
```

## Factory API

| Method | Starts immediately | Stops on dispose | Identity behavior |
|---|---:|---:|---|
| `CreateRecorder(name, description?)` | No | No | Uses `name` as both operation key and display name; supports repeated `Start()` / `Stop()` samples. |
| `BeginScope(name, description?)` | Yes | Yes | Uses `name` as both operation key and display name; intended for one disposable scope. |
| `BeginInvocation(operationKey, displayName, invocationId, description?)` | Yes | Yes | Preserves a stable aggregate key and caller-provided non-empty invocation ID. |

Operation keys, names, and display names cannot be empty or have leading/trailing whitespace. `BeginInvocation(...)` also rejects `Guid.Empty`.

`CreateRecorder(...)` is reusable, but disposing it does not stop an active sample automatically. Call `Stop()` before disposal. `BeginScope(...)` and `BeginInvocation(...)` are auto-started scopes and record on disposal.

## Query API

| Method | Result |
|---|---|
| `GetStatistics()` | Snapshot dictionary of all completed aggregates, keyed by operation key. |
| `GetStatistics(operationKey)` | One completed aggregate, or `null` when the key has no completed sample. |
| `GetRunningOperations()` | Snapshot dictionary of active operations, keyed by invocation ID. |
| `Reset(operationKey)` | Removes completed statistics for one operation key. |

`Reset(...)` does not cancel an active operation. A later completion for the same key creates a new aggregate.

## Automatic Execution Pipeline behavior

The module depends on Execution Pipeline and registers `ExecutionTimingBehavior<,>` at `ExecutionBehaviorOrder.Diagnostics + 100`. The behavior selects only descriptors with `IsBusinessOperation == true`, begins a timing invocation using the descriptor operation key and display name, and always disposes the scope when the terminal operation succeeds, fails, or is cancelled.

## Module dependencies

| Dependency | When composed | Why |
|---|---|---|
| Execution Pipeline | Always | Measures native Monica business-operation boundaries. |
| HostedService | `AggregationMode == BackgroundBatch` | Runs the background queue-draining coordinator through the Generic Host lifecycle. |

Because the module can downgrade from a Web module, these dependencies and all public recording/query APIs work with `Host.CreateApplicationBuilder(...)`. Endpoint mapping is skipped outside ASP.NET Core.

## Related UI module

`monica.AddExecutionTimingUI()` registers the built-in `/execution-timing` page and composes Execution Timing, Localization, and Shell UI when its page is enabled. The UI module is optional; the infrastructure module and public query API do not require it.
