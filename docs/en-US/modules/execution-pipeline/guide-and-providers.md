---
title: Guide and Adapters
description: Register execution behaviors and understand the adapters supplied by Monica modules.
sidebar_position: 4
---

# Guide and Adapters

The pipeline has one registration Guide and multiple subsystem-owned adapters. There is no provider selection: each subsystem describes its own entry point and invokes `IExecutionPipeline`.

## Guide methods

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `AddBehavior(Type, int, Func<ExecutionDescriptor, bool>?, ServiceLifetime)` | Registers a closed or open generic behavior. | No | Shared infrastructure behaviors or broad host policy. |
| `AddBehavior<TBehavior>(int, Func<ExecutionDescriptor, bool>?, ServiceLifetime)` | Registers a closed behavior class. | No | One known input/result contract. |

`AddExecutionPipeline()` without behaviors is valid. Native modules can still register their own behaviors and adapters through the same host-owned catalog.

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

## DynamicProxy bridge

DynamicProxy is not a pipeline provider and is not required by any native adapter. Its optional `UseExecutionPipeline(...)` bridge exists only for selected asynchronous service methods that have no subsystem-owned adapter. See [DynamicProxy](../dynamic-proxy/index.md).
