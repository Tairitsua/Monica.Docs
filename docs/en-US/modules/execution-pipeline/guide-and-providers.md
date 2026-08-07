---
title: Guide and Adapters
description: Register execution behaviors, query observed plans, and add the runtime catalog page.
sidebar_position: 4
---

The pipeline has one registration Guide and multiple subsystem-owned adapters. There is no provider selection: each subsystem describes its own entry point and invokes `IExecutionPipeline`.

## Guide methods

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `AddBehavior(Type, int, Func<ExecutionDescriptor, bool>?, ServiceLifetime)` | Registers a closed or open generic behavior. | No | Shared infrastructure behaviors or broad host policy. |
| `AddBehavior<TBehavior>(int, Func<ExecutionDescriptor, bool>?, ServiceLifetime)` | Registers a closed behavior class. | No | One known input/result contract. |

`AddExecutionPipeline()` without behaviors is valid. Native modules can still register their own behaviors and adapters through the same host-owned catalog.

## Catalog APIs

| API | Behavior | Side effects |
|---|---|---|
| `IExecutionPipelineCatalog.GetSnapshot()` | Returns all registrations and every observed or explicitly inspected plan. | None; it does not resolve behaviors or evaluate filters. |
| `IExecutionPipelineCatalog.InspectPlan(descriptor)` | Materializes the exact plan for one reusable descriptor and returns its ready or faulted snapshot. | Evaluates registration filters and generic compatibility once, then caches the result. |
| `ExecutionPipelineCatalogFacade.GetSnapshotAsync()` | Returns the current snapshot as `Res<ExecutionPipelineCatalogSnapshot>` for UI and other host entry points. | None beyond creating the point-in-time result envelope. |

Registration snapshots retain the configured `Order` and `ServiceLifetime`, whether a registration is open generic or filtered, and its nullable `SourceModuleKey`. A module key identifies a module-contributed behavior; `null` identifies a direct host registration. Applied-plan entries also show the registered type and the closed resolved type, which makes open-generic application visible without resolving an instance.

The catalog uses the same ordering contract as execution: lower orders are outermost, and implementation type identity is the deterministic tie-breaker for equal orders. The applied list reports that exact order with one-based positions.

## Runtime catalog UI

Register the optional page from `Monica.Framework.UI`:

```csharp
builder.AddMonica(monica =>
{
    monica.AddExecutionPipelineUI();
});
```

When enabled, `AddExecutionPipelineUI()` depends on ExecutionPipeline, Localization, and Shell UI. It registers `/execution-pipeline` under the Infrastructure navigation category. The page provides registration and observed-plan summaries, filters by stable descriptor/catalog metadata, and an ordered plan detail view. It reads through `ExecutionPipelineCatalogFacade` and refreshes only when requested.

Set `ModuleExecutionPipelineUIOption.DisablePage` to `true` when a composed UI bundle must omit this page. The disabled UI module registers no page state or UI dependencies and does not change a Core execution pipeline registered independently.

## Native adapters

| Module or subsystem | Point | Input boundary | Transaction mode |
|---|---|---|---|
| Mediator | `MediatorExecutionPoints.Request` | `IRequestHandler<TRequest, TResponse>` | `Automatic` |
| AutoControllers | `MvcExecutionPoints.Action` | Direct MVC action | `Automatic` |
| EventBus | `EventBusExecutionPoints.LocalHandler` | `ILocalEventHandler<TEvent>` | `Automatic` |
| EventBus | `EventBusExecutionPoints.DistributedHandler` | `IDistributedEventHandler<TEvent>` | `Automatic` |
| Seeder | `SeederExecutionPoints.Run` | `ISeeder` | `Automatic` |
| Hosted service | `HostedServiceExecutionPoints.WorkItem` | `IHostedServiceWorkItem` or its typed form | `Automatic` |
| JobScheduler | `JobSchedulerExecutionPoints.RecurringAttempt` | `IRecurringJob` | `None` |
| JobScheduler | `JobSchedulerExecutionPoints.TriggeredAttempt` | `ITriggeredJob<TArgs>` | `None` |
| Hosted service | `HostedServiceExecutionPoints.Start` / `Stop` | Service lifecycle | `None` |

Generated mediated controllers carry `[MediatedController]`, so their actions are handled at the Mediator boundary and skipped by the direct MVC adapter. A handwritten controller that calls `IMediator` must add `[MediatedController]` explicitly; calling Mediator alone is not detected and would otherwise create nested MVC and Mediator boundaries.

## Transaction behavior

The Unit of Work module registers its behavior at `ExecutionBehaviorOrder.UnitOfWork` and selects only descriptors with `ExecutionTransactionMode.Automatic`.

`Automatic` means “eligible for the registered automatic behavior,” not “a transaction always exists.” The behavior is present only when the host composes the Unit of Work module.

Jobs and hosted-service lifecycle calls use `None` because one outer transaction is usually the wrong lifetime. They may still open explicit `IUnitOfWorkManager` scopes around bounded writes.

Other built-in integrations add behaviors only when their modules are composed: Authorization checks business operations, ChainTracing records business call chains, ExecutionTiming measures business operations, and Unit of Work selects automatic transaction descriptors.

## Custom adapters

Prefer a custom adapter when a subsystem owns a stable entry contract. The adapter should:

1. publish one reusable `ExecutionPoint`;
2. obtain a memoized descriptor through `ExecutionDescriptor.ForMethod<TInput, TResult>(...)` or `ForInterface<TInput, TResult>(...)`;
3. resolve `IExecutionPipeline` from the target's current scope;
4. pass the real input, target, cancellation token, and terminal delegate;
5. choose `ExecutionTransactionMode` deliberately.

`ForInterface(...)` requires an implemented interface that maps exactly one entry method. Repeated calls to the same factory with the same stable inputs return the same descriptor reference; `ForMethod(...)` and `ForInterface(...)` remain distinct boundary identities.

For a no-result `Func<Task>` terminal, create the descriptor as `ForMethod<TInput, ExecutionUnit>(...)` or `ForInterface<TInput, ExecutionUnit>(...)`. The no-result pipeline overload requires `ExecutionDescriptor.ResultType` to be exactly `ExecutionUnit`.

Use `ExecutionFeatureCollection` for adapter-specific invocation metadata. Features are keyed by their exact generic type, belong to one invocation, and are not thread-safe; do not mutate one collection concurrently.

## Services without a native adapter

An ordinary service method runs inside its caller's existing execution boundary. If a subsystem genuinely owns a new independently observable entry point, implement a typed adapter that supplies its descriptor, input, target, cancellation token, and transaction policy explicitly. Do not introduce container-wide method interception as a substitute for an owned boundary.
