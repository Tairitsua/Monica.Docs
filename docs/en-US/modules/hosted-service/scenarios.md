---
title: Scenarios
description: Apply instance-aware Hosted Service observation and checkpoint coordination in real hosts.
sidebar_position: 5
---

# Scenarios

## Multiple instances of one worker type

Use separate singleton `IHostedService` descriptors when one worker implementation serves several logical providers or tenants. Each factory must return a new object, and each object should expose an operationally meaningful `ServiceKey`.

```csharp
builder.Services.AddSingleton<IHostedService>(services =>
    ActivatorUtilities.CreateInstance<QueueConsumer>(services, "orders"));
builder.Services.AddSingleton<IHostedService>(services =>
    ActivatorUtilities.CreateInstance<QueueConsumer>(services, "payments"));
```

In this example, `QueueConsumer` accepts the key as its explicit constructor argument and returns it from its `ServiceKey` override; its framework dependencies are supplied by `ActivatorUtilities`. Both objects appear in `GetServices<QueueConsumer>()` with distinct `InstanceId` values. `GetServicesByKey("orders")` is still plural; use the returned instance ID for exact follow-up operations.

Do not register one pre-created object under two `IHostedService` descriptors. Monica rejects duplicate object identity before any hosted service starts.

## Wait for one exact dependency

A background consumer can wait for a producer instance to publish a named readiness checkpoint. Type-only waits are appropriate only when the host contains exactly one producer of that type.

```csharp
// In the producer instance after its catalog becomes usable:
checkpoints.SignalCheckpoint(this, "catalog-ready");

// In a dependent background operation:
await checkpoints.WaitForCheckpointAsync<CatalogLoader>(
    "primary",
    "catalog-ready",
    cancellationToken: stoppingToken);
```

If several `CatalogLoader` instances can share the `"primary"` key, resolve one through `IMoHostedServiceRegistry`, retain its `InstanceId`, and use the instance-ID overload instead.

Avoid synchronously blocking sequential host startup while waiting for another service's later `StartAsync`. Put dependency waits in the long-running background operation, or deliberately configure concurrent startup with lifecycle ordering you understand.

## Inspect shutdown results

Query the registry after `host.StopAsync()` to inspect final `Stopped`, `Faulted`, or `Degraded` states and state history:

```csharp
await host.StopAsync();

var finalSnapshots = registry.GetAllServices();
foreach (var snapshot in finalSnapshots)
{
    Console.WriteLine($"{snapshot.InstanceId}: {snapshot.CurrentState}");
}
```

The registry retains these snapshots until host disposal. Runtime observers have already been detached, so post-stop state mutations are not treated as active lifecycle observations.

## Common mistakes

- Registering an `IHostedService` as scoped or transient.
- Assuming a concrete type, display name, or `ServiceKey` identifies only one instance.
- Calling the type-only checkpoint overload when multiple matching instances exist.
- Signaling a checkpoint with an arbitrary type or key instead of the producer's own `IMoHostedService` identity.
- Expecting a standard `IHostedService` that does not implement `IMoHostedService` to appear in the registry.
