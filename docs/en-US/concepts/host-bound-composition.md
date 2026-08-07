---
title: Host-bound composition
description: Understand how Monica records, validates, and applies one module graph per host.
sidebar_position: 1
---

`builder.AddMonica(monica => ...)` owns one Monica application context. Every option, guide, dependency edge, runtime catalog, and diagnostic snapshot created during that callback belongs to the same host.

## Lifecycle

1. Your callback records requested modules and guide configuration.
2. Modules declare their dependencies into the same graph.
3. Monica validates required guide choices and rejects dependency cycles.
4. The graph is ordered deterministically.
5. Options are finalized and services are registered through serial module phases. A module may schedule isolated CPU-bound work while those serial callbacks continue.
6. Monica waits at each composition checkpoint for work whose declared deadline has arrived. The final checkpoint drains every remaining work item before `AddMonica(...)` returns.
7. A Generic Host completes composition when service registration and all scheduled composition work finish.
8. A Web Host remains incomplete until `UseMonica()` applies middleware and `MapMonica()` maps endpoints.

The graph is sealed when the callback returns. A retained guide cannot mutate it afterward.

For a Web Host, call `UseMonica()` and `MapMonica()` exactly once, in that order, on the same `WebApplication` instance. Starting the host before both calls complete fails validation before any hosted lifecycle participant runs. Generic Hosts do not call either method; their module graph must contain only modules that support non-Web operation or an explicit non-Web downgrade.

## Scheduled composition work

A materialized module can call the protected `ModuleBase.ScheduleCompositionWork(string name, Action work, ModuleCompositionWorkDeadline deadline = BeforeServiceRegistrationCompletion)` method after it has prepared an immutable or exclusively module-owned input snapshot. Scheduling is valid only synchronously on that module's callback thread while its `ConfigureBuilder`, `ConfigureServices`, or `PostConfigureServices` callback is executing. Monica starts eligible work through a bounded worker pool while the serial composition thread continues with other module callbacks.

The deadline names the latest composition checkpoint at which the work must be complete; it is not a timeout:

| Deadline | Required completion checkpoint |
|---|---|
| `BeforeBusinessTypeIteration` | Before Monica iterates discovered business types. |
| `BeforePostConfigureServices` | Before any `PostConfigureServices` callback begins. |
| `BeforeServiceRegistrationCompletion` | Before service registration completes and `AddMonica(...)` returns. This is the default. |

All scheduled work is required. Monica waits at the declared checkpoint, propagates failures before continuing, and never lets composition work outlive `AddMonica(...)`. The API does not make `ConfigureServices`, `PostConfigureServices`, or any other module callback concurrent.

The work action must be synchronous, deterministic, CPU-bound, and isolated. Monica rejects `async`/`async void` delegates and does not flow the caller's ambient `ExecutionContext` into workers; capture required module-owned values explicitly. The action must not mutate the host builder, `IServiceCollection`, the module graph, a service provider, or shared static state, and it must not rely on another work item's completion order. Monica owns scheduling; module authors should not add `Task.Run`, `Task.WhenAll`, or fire-and-forget work.

Use standard `IHostedLifecycleService` or hosted services for runtime activation, I/O, long-running work, and cleanup. Scheduled composition work is only for required pre-build computation, such as compiling a fully prepared module-owned mapping catalog.

## Why the boundary matters

- Two hosts in one test process do not overwrite each other's module options.
- Invalid graphs fail before an application begins serving traffic.
- Module diagnostics describe the host you are inspecting, not a process-global approximation.
- Coding agents have one obvious place to discover application capabilities.

## Public module shape

Every module follows the same shape:

| Part | Responsibility |
|---|---|
| `monica.Add{Name}()` | Adds the module to the current host graph. |
| `Module{Name}Option` | Configures host-owned behavior and defaults. |
| `Module{Name}Guide` | Selects providers or optional capabilities. |
| `Module{Name}` | Declares dependencies and applies lifecycle phases. |
| `ModuleBase.ScheduleCompositionWork(...)` | Schedules required isolated CPU-bound work with an explicit composition deadline. |

Provider choices remain explicit. For example, JobScheduler does not silently choose a persistence provider; the guide makes the decision visible in the composition root.

## Test the same boundary

`MonicaTestApplicationFactory<TDiscoveryAnchor>` creates a complete, independently owned Monica host for each application scenario. Use it when a test must prove module composition, type discovery, options, interception, persistence, or lifecycle behavior.

[Read the testing guide](../guides/testing-monica-applications.md).
