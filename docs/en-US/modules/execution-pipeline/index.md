---
title: Execution Pipeline
description: Apply ordered, typed behaviors and inspect the exact runtime plans used by Monica execution boundaries.
sidebar_position: 1
---

# Execution Pipeline

`Monica.Core` provides one typed pipeline for cross-cutting behavior around requests, events, jobs, hosted work, seeders, and direct MVC actions. Each subsystem owns its adapter, while the host owns the behavior catalog. The same module exposes a read-only runtime catalog of registered behaviors and the exact plans that have been observed or explicitly inspected.

## When to use this module

- Add a behavior that should apply consistently to one or more Monica execution boundaries.
- Select behavior by stable descriptor metadata such as point, component type, business-operation flag, or transaction mode.
- Verify which behaviors actually apply to an operation and in which nesting order.
- Build a module-owned adapter for a new execution boundary.

Do not use the pipeline to hide ordinary service orchestration. A behavior should express a genuine cross-cutting concern such as diagnostics, authorization, routing, or transaction coordination.

## Package and registration

| Item | Value |
|---|---|
| Package | `Monica.Core` |
| Registration | `monica.AddExecutionPipeline()` |
| Related UI package | `Monica.Framework.UI` |
| Related UI registration | `monica.AddExecutionPipelineUI()` |
| UI route | `/execution-pipeline` |

Mediator, EventBus, JobScheduler, AutoControllers, Seeder, hosted-service, authorization, profiling, and Unit of Work modules register their pipeline dependency when needed. Call `AddExecutionPipeline()` directly when the host adds custom behaviors or owns a custom adapter.

## Public surface

| API | Purpose |
|---|---|
| `ModuleExecutionPipelineGuide.AddBehavior(...)` | Registers one ordered behavior implementation and optional descriptor filter. |
| `IExecutionBehavior<TInput, TResult>` | Wraps or short-circuits a typed execution. |
| `IExecutionPipeline` | Executes a subsystem-owned terminal delegate through the applicable plan. |
| `IExecutionPipelineCatalog` | Reads the host-local registration catalog or explicitly inspects one descriptor plan. |
| `ExecutionPipelineCatalogFacade` | Returns a UI-safe `Res<ExecutionPipelineCatalogSnapshot>` snapshot through `GetSnapshotAsync()`. |
| `ExecutionDescriptor` | Describes stable boundary metadata and provides memoized factories. |
| `ExecutionContext<TInput>` | Carries invocation input, target, cancellation, and features. |
| `ExecutionFeatureCollection` | Carries adapter-owned, invocation-local typed metadata. |
| `ExecutionPoint` | Identifies a stable, case-sensitive subsystem boundary. |
| `ExecutionBehaviorOrder` | Defines standard ordering bands. |
| `ExecutionTransactionMode` | Declares whether automatic transaction behavior is allowed. |

When no behavior applies, the pipeline invokes the terminal operation directly. Behavior instances are resolved from the same dependency-injection scope as `IExecutionPipeline`.

## Runtime catalog semantics

The catalog separates configured intent from observed runtime truth:

- **Registrations** always list every behavior registered for the current host, including its order, lifetime, open-generic and filter flags, and source module. A missing source module means the host registered the behavior directly.
- **Plans** appear only after a descriptor has executed or a caller has explicitly passed it to `IExecutionPipelineCatalog.InspectPlan(...)`.
- Applied behaviors are listed **outermost first**, in the exact order used by execution. A ready plan with no applicable behaviors has an empty chain.
- A descriptor-filter failure is retained as a faulted plan and is rethrown when execution requests that plan again.

`GetSnapshot()` and `ExecutionPipelineCatalogFacade.GetSnapshotAsync()` are observation-only operations: they do not resolve behavior instances, execute descriptor filters, or synthesize plans for operations that have never been seen. Catalog state is host-local and in memory; it contains stable type and descriptor metadata, not invocation inputs, principals, targets, or request state.

## Related pages

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Adapters](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [Execution boundaries](../../concepts/execution-boundaries.md)
