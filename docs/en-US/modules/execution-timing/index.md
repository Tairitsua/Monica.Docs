---
title: Execution Timing
description: Measure Monica business executions and application-owned scopes in Web or Generic Hosts.
sidebar_position: 1
---

Execution Timing collects running-operation snapshots and aggregated duration statistics for Monica business executions and application-owned scopes. It works in both ASP.NET Core and Generic Hosts: Web applications may expose diagnostic endpoints, while workers retain the same recording, aggregation, and query APIs without adding an HTTP surface.

## When to use this module

- Measure all Monica execution-pipeline descriptors marked as business operations.
- Time application-owned work that does not enter a Monica execution adapter.
- Query current operations and completed statistics from a Web application or worker.
- Move frequent sample aggregation off the caller thread with background batching.

Execution Timing is an in-process diagnostic capability. Its statistics are host-local and reset when the process restarts.

## Package and registration

| Item | Value |
|---|---|
| Package | `Monica.Profiling` |
| Maturity | Labs |
| Registration | `monica.AddExecutionTiming()` |
| Related UI registration | `monica.AddExecutionTimingUI()` |
| UI route | `/execution-timing` |

`Monica.Profiling` is a Labs package and may change before promotion. `AddExecutionTiming()` automatically composes the Execution Pipeline and, in background mode, the HostedService module.

## Public surface

| API | Purpose |
|---|---|
| `IExecutionTimingFactory` | Creates reusable recorders, auto-started scopes, and invocation scopes with explicit stable identities. |
| `IExecutionTimingRecorder` | Starts, stops, and optionally logs a timing sample. |
| `IExecutionTimingQuery` | Reads completed statistics and running operations, or resets one completed-statistics entry. |
| `ExecutionTimingFacade` | Returns sorted statistics and running operations in Monica `Res<T>` envelopes for APIs and UI. |
| `ExecutionTimingStatistics` | Describes count, average and latest duration, timestamps, and optional allocation fields for one operation key. |
| `RunningExecutionTimingInfo` | Describes one active invocation and its current elapsed duration. |
| `ExecutionTimingAggregationMode` | Selects inline or background-batch aggregation. |

`EnableMemoryTracking` on `IExecutionTimingRecorder` is obsolete. It uses thread-local allocation counters and is not reliable across asynchronous continuations.

## Host behavior

| Host | Collection and query | Aggregation | HTTP endpoints |
|---|---|---|---|
| Generic Host | Available | Inline or background batch | Never mapped |
| ASP.NET Core Web Host | Available | Inline or background batch | Controlled only by `EnableMinimalApi` |

The module automatically adds an execution behavior for descriptors whose `IsBusinessOperation` flag is `true`. Manual recorders use the same collector, so automatic and application-owned measurements can be queried together.

## Related pages

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Runtime APIs](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [Execution Pipeline](../execution-pipeline/index.md)
