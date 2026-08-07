---
title: Registration and Runtime APIs
description: Understand Hosted Service registration, instance identity, registry queries, and checkpoint selection.
sidebar_position: 4
---

## Module registration

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `monica.AddHostedService(options => { ... })` | Registers runtime observation, the instance-aware registry, checkpoint coordination, metrics, and Generic Host lifecycle integration. | Yes | Add observable hosted services to a Generic Host or Web Host. |

`AddHostedService(...)` returns `ModuleRegistration<ModuleHostedService, ModuleHostedServiceOption>`. The returned registration has no provider-selection extensions; the module automatically composes its Observable Instance and Execution Pipeline dependencies.

## Instance identity

The registry preserves multiplicity instead of assuming one object per concrete type:

- `IMoHostedService.ServiceKey` is an optional application-defined discriminator. Several instances may share a type or even a key.
- `HostedServiceRuntimeInfo.InstanceId` uniquely identifies one runtime object in the current host.
- Two distinct objects of the same concrete type receive distinct instance IDs.
- One object registered more than once is invalid.

Use plural queries for discovery, then retain `InstanceId` when later work must address the same exact object.

## Registry queries

| API | Selection |
|---|---|
| `GetAllServices()` | Every registered `IMoHostedService`. |
| `GetServices<TService>()` | All instances whose concrete type is exactly `TService`. |
| `GetServices(Type)` | All instances whose concrete type exactly matches the supplied type. |
| `GetServicesByName(name)` | All instances with the case-insensitive service name. |
| `GetServicesByKey(key)` | All instances with the exact key; pass `null` for default instances. |
| `GetServiceByInstanceId(instanceId)` | One exact instance, or `null` when it is absent. |
| `GetServicesByState(state)` | All instances in a runtime state. |
| `GetUnhealthyServices()` | Instances that are not currently healthy. |

Type, name, and key APIs are intentionally plural because those values are not unique identities.

## Checkpoint coordination

`IMoHostedServiceCheckpointCoordinator` offers three selection forms:

| Call | Selection rule |
|---|---|
| `WaitForCheckpointAsync<TService>(checkpoint, ...)` | Requires exactly one registered instance of `TService`. |
| `WaitForCheckpointAsync<TService>(serviceKey, checkpoint, ...)` | Requires exactly one instance matching both type and key. |
| `WaitForCheckpointAsync(instanceId, checkpoint, ...)` | Selects one exact runtime instance. |

Missing and ambiguous selections throw `InvalidOperationException` with the available identity context. Waits honor cancellation, can require a checkpoint occurrence at or after `notBeforeUtc`, and fail if the selected service faults before signaling.

The producer signals with its own identity:

```csharp
checkpointCoordinator.SignalCheckpoint(this, "catalog-ready");
```

Passing the producing `IMoHostedService` prevents one instance from signaling on behalf of another. Monica verifies that the source's `RuntimeInfo.InstanceId` belongs to the current registry.

## Lifecycle visibility

The module resolves services, materializes identities, attaches runtime observers, and publishes one registry snapshot in `IHostedLifecycleService.StartingAsync`. This occurs before application `IHostedService.StartAsync` calls. Observers are detached after services stop, while the final runtime information remains queryable until host disposal.
