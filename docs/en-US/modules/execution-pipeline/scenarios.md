---
title: Scenarios
description: Target execution points, inspect applied runtime behaviors, and choose explicit transaction boundaries.
sidebar_position: 5
---

# Scenarios

## Scenario 1 — Apply a behavior to one subsystem

Use the public execution-point constant in the descriptor filter:

```csharp
builder.AddMonica(monica =>
{
    monica.AddExecutionPipeline()
        .AddBehavior(
            typeof(HandlerMetricsBehavior<,>),
            ExecutionBehaviorOrder.Diagnostics,
            descriptor =>
                descriptor.Point == EventBusExecutionPoints.DistributedHandler);

    monica.AddEventBus();
});
```

The predicate is evaluated once per stable descriptor plan. Inspect the event value or delivery metadata inside the typed behavior, not in the predicate.

## Scenario 2 — Short-circuit an execution

A behavior may return a valid `TResult` without calling `next`. This is appropriate for a routing behavior that completes work remotely, an authorization behavior that returns the boundary's normal denial result, or a cache that already owns a complete result.

Short-circuiting transfers responsibility for the final result to that behavior. Do not call `next` after remote execution has been attempted merely to “fall back” locally; doing so can execute the same business operation in the wrong location.

## Scenario 3 — Keep jobs observable without one long transaction

JobScheduler attempts enter the pipeline for diagnostics, authorization, routing, and application behaviors, but their transaction mode is `None`. Put writes into explicit, bounded units:

```csharp
public async Task ExecuteAsync(CancellationToken cancellationToken)
{
    var records = await LoadCandidatesAsync(cancellationToken);

    foreach (var batch in records.Chunk(100))
    {
        await unitOfWorkManager.RunAsync(
            async () =>
            {
                foreach (var record in batch)
                {
                    await ProcessAsync(record, cancellationToken);
                }
            },
            cancellationToken: cancellationToken);
    }
}
```

Choose the batch by business atomicity and lock duration, not by the pipeline boundary. Use `RequiresNew` only when a category or batch must commit independently of any ambient scope.

## Scenario 4 — Attach adapter-specific metadata

A custom adapter can create an `ExecutionFeatureCollection`, store a typed feature with `Set<TFeature>(...)`, and pass it to `IExecutionPipeline.ExecuteAsync(...)`. A behavior retrieves it with `TryGet<TFeature>(...)` or `GetRequired<TFeature>()`.

Feature keys use the exact generic type. Registering a concrete implementation does not make it available through one of its interfaces.

## Scenario 5 — Explain the behavior chain used by an operation

Register `monica.AddExecutionPipelineUI()` and open `/execution-pipeline` after exercising the operation. Select its observed plan to inspect:

- the stable operation, component, contract, method, input/result, business-operation, and transaction metadata;
- the exact applied chain from outermost to innermost;
- each behavior's configured order, lifetime, source module, registered type, and resolved closed type;
- a cached materialization error when the plan is faulted.

If an application owns a reusable descriptor but the operation has not run yet, it can explicitly materialize that plan without resolving behavior instances:

```csharp
var plan = executionPipelineCatalog.InspectPlan(descriptor);
```

Use `InspectPlan(...)` only for a descriptor the application already owns. `GetSnapshot()` and the UI deliberately do not invent descriptors or execute filters merely to make the catalog look complete.

## Common mistakes

- Registering the same behavior through both `AddBehavior(...)` and `IServiceCollection`.
- Using request or user state in a descriptor filter.
- Depending on relative order between equal-order behaviors.
- Calling `next` more than once.
- Adding DynamicProxy around a contract that already has a native adapter.
- Treating `ExecutionTransactionMode.None` as a prohibition on explicit unit-of-work scopes.
- Expecting plans for operations that have never executed or been explicitly inspected.
- Grouping by `OperationKey` alone when business-operation or transaction policies differ.
