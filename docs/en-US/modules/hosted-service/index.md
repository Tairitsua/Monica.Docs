---
title: Hosted Service
description: Observe Generic Host services, query instance-aware runtime state, and coordinate readiness checkpoints.
sidebar_position: 1
---

# Hosted Service

The Hosted Service module builds an observable runtime catalog for Monica services registered through the standard .NET Generic Host. It tracks each `IMoHostedService` instance independently, exposes state and health queries, and coordinates named checkpoints without replacing `IHostedService` or the Generic Host lifecycle.

## When to use this module

- Observe startup, running, degraded, faulted, and stopped states for background workers.
- Keep multiple distinct instances of one concrete service type, including instances distinguished by `ServiceKey`.
- Let one hosted service wait for a readiness checkpoint produced by another exact instance.
- Inspect final stopped snapshots after `StopAsync`; runtime snapshots remain queryable until the host is disposed.

## Package and registration

| Item | Value |
|---|---|
| Package | `Monica.Core` |
| Monica registration | `monica.AddHostedService()` |
| Host registration | Standard `builder.Services.AddHostedService<TService>()` or singleton `IHostedService` descriptors |
| Related UI module | None |

## Public surface

- `IMoHostedService` defines observable identity and runtime information. `ServiceKey` distinguishes instances of the same type.
- `MoHostedService` and `MoBackgroundService` provide observable base implementations for finite hosted services and long-running workers.
- `HostedServiceRuntimeInfo.InstanceId` is the exact identity of one instance in the current host.
- `IMoHostedServiceRegistry` exposes plural type, name, key, state, and health queries plus exact instance lookup.
- `IMoHostedServiceCheckpointCoordinator` waits for and signals instance-aware checkpoints.

The module publishes its registry snapshot during `IHostedLifecycleService.StartingAsync`, before any hosted service's `StartAsync` runs. A service can therefore look itself or its dependencies up from its own startup code.

## Related pages

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Runtime APIs](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
