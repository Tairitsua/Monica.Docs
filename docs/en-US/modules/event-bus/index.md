---
title: EventBus
description: Publish local events now and add a distributed provider when deployment requires one.
sidebar_position: 1
---

`Monica.EventBus` provides local and distributed publishing contracts, automatic handler discovery, observable subscriptions, and keyed bus composition. EventBus is a Generic Host module; Web applications use the same registration and add the normal `UseMonica()` and `MapMonica()` composition boundary.

## When to use this module

- Publish and handle events inside one Monica host.
- Add a distributed provider only when events must cross process boundaries.
- Give a module or subsystem a bus identified by a stable service key.
- Manage manual subscriptions through a cancellable, observable registry.

## Package and registration

| Item | Value |
|---|---|
| Package | `Monica.EventBus` |
| Registration | `monica.AddEventBus()` |
| Related UI registration | `monica.AddEventBusUI()` |

## Public surface

- `IEventBus`, `ILocalEventBus`, and `IDistributedEventBus` define publishing and subscription boundaries.
- `ILocalEventHandler<TEvent>` and `IDistributedEventHandler<TEvent>` define handler contracts.
- `IEventSubscriptionRegistry` provides observable queries and cancellable mutation APIs.
- Registration extensions on `ModuleRegistration<ModuleEventBus, ModuleEventBusOption>` select a distributed provider and register keyed buses.

Automatic discovery is enabled by default. EventBus creates discovered subscriptions as a rollback-protected batch during Generic Host startup, before provider `StartAsync` runs. Failure or cancellation removes entries already created by that batch before propagating the startup error; shutdown removes only lifecycle-owned subscription IDs in reverse order and preserves manual subscriptions.

Dispatch uses the exact published event type and topic. Local and distributed handlers enter the shared [Execution Pipeline](../execution-pipeline/index.md) through EventBus-owned adapters, so each delivery has one explicit execution boundary.

## Related pages

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Registration and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
