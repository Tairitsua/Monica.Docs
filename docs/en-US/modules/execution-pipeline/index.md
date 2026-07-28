---
title: Execution Pipeline
description: Apply ordered, typed cross-cutting behaviors to Monica execution boundaries.
sidebar_position: 1
---

# Execution Pipeline

`Monica.Core` provides one typed pipeline for cross-cutting behavior around requests, events, jobs, hosted work, seeders, and direct MVC actions. Each subsystem owns its adapter, while the host owns the behavior catalog.

## When to use this module

- Add a behavior that should apply consistently to one or more Monica execution boundaries.
- Select behavior by stable descriptor metadata such as point, component type, business-operation flag, or transaction mode.
- Build a module-owned adapter for a new execution boundary.

Do not use the pipeline to hide ordinary service orchestration. A behavior should express a genuine cross-cutting concern such as diagnostics, authorization, routing, or transaction coordination.

## Package and registration

| Item | Value |
|---|---|
| Package | `Monica.Core` |
| Registration | `monica.AddExecutionPipeline()` |
| Related UI module | None |

Mediator, EventBus, JobScheduler, AutoControllers, Seeder, hosted-service, authorization, profiling, and Unit of Work modules register their pipeline dependency when needed. Call `AddExecutionPipeline()` directly when the host adds custom behaviors or owns a custom adapter.

## Public surface

| API | Purpose |
|---|---|
| `ModuleExecutionPipelineGuide.AddBehavior(...)` | Registers one ordered behavior implementation and optional descriptor filter. |
| `IExecutionBehavior<TInput, TResult>` | Wraps or short-circuits a typed execution. |
| `IExecutionPipeline` | Executes a subsystem-owned terminal delegate through the applicable plan. |
| `ExecutionDescriptor` | Describes stable boundary metadata and provides memoized factories. |
| `ExecutionContext<TInput>` | Carries invocation input, target, cancellation, and features. |
| `ExecutionFeatureCollection` | Carries adapter-owned, invocation-local typed metadata. |
| `ExecutionPoint` | Identifies a stable, case-sensitive subsystem boundary. |
| `ExecutionBehaviorOrder` | Defines standard ordering bands. |
| `ExecutionTransactionMode` | Declares whether automatic transaction behavior is allowed. |

When no behavior applies, the pipeline invokes the terminal operation directly. Behavior instances are resolved from the same dependency-injection scope as `IExecutionPipeline`.

## Related pages

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Adapters](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [Execution boundaries](../../concepts/execution-boundaries.md)
- [DynamicProxy](../dynamic-proxy/index.md)
