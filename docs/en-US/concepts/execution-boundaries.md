---
title: Execution Boundaries
description: Understand how Monica applies one typed behavior pipeline across requests, events, jobs, hosted work, and optional proxies.
sidebar_position: 3
---

# Execution Boundaries

An execution boundary is a code entry point that a Monica subsystem owns and can describe consistently. The shared execution pipeline lets authorization, routing, diagnostics, and transactions wrap those entry points without giving each subsystem a different interception model.

## Boundary, descriptor, and invocation

Each execution has three parts:

- an immutable `ExecutionDescriptor` identifies the stable boundary;
- an `ExecutionContext<TInput>` carries the current input, target, cancellation token, and optional features;
- an ordered set of `IExecutionBehavior<TInput, TResult>` implementations surrounds the subsystem's terminal operation.

The descriptor contains stable metadata such as the execution point, operation name, component type, entry method, input and result types, business-operation flag, and transaction mode. Request data belongs in the context, never in the descriptor.

## Native boundaries

Monica modules adapt their own contracts directly:

| Boundary | Execution point | Transaction mode |
|---|---|---|
| Mediator request handler | `mediator.request` | `Automatic` |
| Direct MVC action | `webapi.mvc-action` | `Automatic` |
| Local EventBus handler | `eventbus.local-handler` | `Automatic` |
| Distributed EventBus handler | `eventbus.distributed-handler` | `Automatic` |
| Seeder | `seeder.run` | `Automatic` |
| Hosted-service work item | `hosted-service.work-item` | `Automatic` |
| Recurring job attempt | `jobs.recurring-attempt` | `None` |
| Triggered job attempt | `jobs.triggered-attempt` | `None` |
| Hosted-service start or stop | `hosted-service.start` / `hosted-service.stop` | `None` |

`Automatic` allows the Unit of Work behavior to wrap the boundary when that module is present. `None` prevents an automatic outer transaction but does not prohibit explicit, business-sized unit-of-work scopes.

Jobs deliberately use `None`. A long-running scan should not hold one transaction for its entire attempt; the job should create bounded scopes around the writes that must commit together.

## One owner per boundary

A subsystem with a native adapter owns the boundary exactly once. Monica marks those contracts with `IExecutionAdapterOwnedComponent` so optional proxy integration does not wrap the same call again.

Use the native adapter for Mediator handlers, EventBus handlers, jobs, seeders, MVC actions, and Monica hosted work. Native adapters know the correct input, result, cancellation, features, and transaction policy for their subsystem.

## DynamicProxy is separate

The Execution Pipeline is part of `Monica.Core`. DynamicProxy is a separate opt-in module in `Monica.DependencyInjection`.

You do not need DynamicProxy to use native execution boundaries. Use `AddDynamicProxy()` only when an application intentionally needs method interception. Its `UseExecutionPipeline(...)` method is a narrow compatibility bridge for selected `Task` and `Task<T>` service methods that have no native module adapter.

## Behavior ordering

Lower numeric orders wrap higher orders. Monica provides standard bands:

1. `Diagnostics`
2. `Authorization`
3. `Routing`
4. `UnitOfWork`
5. `Application`

Equal-order behaviors must be semantically independent. Monica uses the implementation type only to make cached plans deterministic; that tie-break is not a behavioral ordering contract. Assign distinct orders whenever nesting matters.

## Related pages

- [Execution Pipeline](../modules/execution-pipeline/index.md)
- [DynamicProxy](../modules/dynamic-proxy/index.md)
- [Unit of Work](../modules/unit-of-work/index.md)
- [ProjectUnits](./project-units.md)
