---
title: Configuration
description: Configure execution behavior selection, catalog metadata, and the optional runtime catalog page.
sidebar_position: 3
---

# Configuration

`ModuleExecutionPipelineOption` has no public runtime settings. The host defines its behavior catalog through `ModuleExecutionPipelineGuide.AddBehavior(...)`.

The optional `ModuleExecutionPipelineUIOption` has one setting:

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `DisablePage` | `bool` | `false` | No | Set to `true` when a composed UI bundle must omit the built-in page. | Skips the page state, route, navigation entry, and UI dependencies. It does not disable a Core pipeline registered independently. |

## Behavior registration

| Parameter | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `behaviorType` | `Type` | — | Yes | Register a closed behavior or a two-parameter open generic behavior. | Must implement a compatible `IExecutionBehavior<TInput, TResult>` contract. |
| `order` | `int` | `ExecutionBehaviorOrder.Application` | No | Place the behavior in the correct nesting band. | Lower values wrap higher values. |
| `descriptorFilter` | `Func<ExecutionDescriptor, bool>?` | `null` | No | Limit the behavior to stable kinds of boundary. | Evaluated while the immutable plan is cached; never inspect invocation state. |
| `lifetime` | `ServiceLifetime` | `Transient` | No | Use scoped or singleton behavior ownership deliberately. | Scoped instances come from the same scope as `IExecutionPipeline`. |

The generic overload `AddBehavior<TBehavior>(...)` accepts a closed behavior class. Use the `Type` overload for an open generic definition such as `typeof(ExecutionTimingBehavior<,>)`.

## Standard order bands

| Constant | Value | Intended concern |
|---|---:|---|
| `ExecutionBehaviorOrder.Diagnostics` | `-3000` | Tracing, metrics, and diagnostics around the complete execution. |
| `ExecutionBehaviorOrder.Authorization` | `-2000` | Authentication and authorization checks. |
| `ExecutionBehaviorOrder.Routing` | `-1000` | Remote routing or another behavior that may short-circuit local work. |
| `ExecutionBehaviorOrder.UnitOfWork` | `0` | Transactions around local application work. |
| `ExecutionBehaviorOrder.Application` | `1000` | Application-specific cross-cutting behavior. |

Equal orders are allowed only for semantically independent behaviors. The implementation type is a deterministic cache tie-break, not a supported way to define semantic order.

## Descriptor filters

Good predicates use immutable facts:

```csharp
descriptor => descriptor.Point == MediatorExecutionPoints.Request
```

```csharp
descriptor =>
    descriptor.IsBusinessOperation
    && descriptor.TransactionMode == ExecutionTransactionMode.Automatic
```

Do not capture a scoped service, current user, request header, argument value, or mutable feature in this predicate. Inspect invocation-specific data inside `ExecuteAsync(...)` through `ExecutionContext<TInput>`.

## Transaction modes

| Value | Meaning |
|---|---|
| `ExecutionTransactionMode.Automatic` | Allows a registered Unit of Work behavior to create an automatic outer scope for this boundary. |
| `ExecutionTransactionMode.None` | Prevents this descriptor from creating an automatic outer scope; application code may still create explicit, bounded scopes. |

`None` does not clear an already-active ambient Unit of Work. Code invoked inside an existing ambient scope still observes it unless it deliberately opens a `RequiresNew` scope.

## Registration rules

- Register each behavior implementation type once per host.
- Let `AddBehavior(...)` own its service descriptor; duplicate host DI registration is rejected.
- Use transient behavior lifetime unless the behavior genuinely owns scoped or process-wide state.
- Preserve exceptions and cancellation unless the behavior intentionally translates them.
- Call `next` no more than once, even when branches or concurrent work are involved.

## Catalog state

The catalog exposes immutable snapshot models rather than live dependency-injection objects:

| Type | What it represents |
|---|---|
| `ExecutionBehaviorRegistrationSnapshot` | One configured behavior with type, order, lifetime, source module, generic status, and filter status. |
| `ExecutionDescriptorSnapshot` | Stable operation metadata used to choose a plan. |
| `ExecutionPipelineAppliedBehaviorSnapshot` | One resolved behavior and its one-based, outer-to-inner position. |
| `ExecutionPipelinePlanSnapshot` | One observed or explicitly inspected plan, its descriptor, state, timestamps, applied chain, and optional error. |
| `ExecutionPipelineCatalogSnapshot` | One point-in-time collection of all registrations and observed plans. |

Plan status has three values:

| Status | Meaning |
|---|---|
| `Building` | Descriptor filters and generic contracts are currently being evaluated. |
| `Ready` | The immutable chain is available; the chain may legitimately be empty. |
| `Faulted` | Plan materialization failed, and the deterministic error is retained for the host lifetime. |

`PlanKey` is the plan identity exposed by diagnostics. It includes the operation identity plus the business-operation and transaction policies that can affect descriptor filters. Do not group plans by `OperationKey` alone when those policies may differ.
