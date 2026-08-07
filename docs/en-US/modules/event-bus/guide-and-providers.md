---
title: Guide and Providers
description: Choose an EventBus provider, register keyed buses, and manage subscriptions safely.
sidebar_position: 4
---

## Guide methods

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `UseDistributedEventBus<TProvider>()` | Registers the default distributed provider. | No | Events cross process boundaries through a real provider. |
| `UseNoOpDistributedEventBus()` | Registers an intentionally non-delivering distributed provider. | No | Local development, tests, or hosts that require the contract without external delivery. |
| `AddKeyedEventBus(key, useDistributed)` | Registers a keyed `IEventBus` backed by the local or configured distributed provider. | No | A module or subsystem owns a named bus boundary. |
| `AddKeyedLocalEventBus(key)` | Registers a separate keyed `ILocalEventBus`. | No | A subsystem needs local isolation without an `IEventBus` mapping. |

`AddKeyedEventBus(key, useDistributed: true)` requires `UseDistributedEventBus<TProvider>()`. Monica rejects the composition when the required provider choice is missing.

## Provider choices

| Choice | How to enable it | When to use it |
|---|---|---|
| Local EventBus | Registered by the module | In-process domain events and module collaboration. |
| No-op distributed provider | `UseNoOpDistributedEventBus()` | Development or hosts that need the distributed contract without external delivery. |
| Distributed provider | `UseDistributedEventBus<TProvider>()` | Delivery through a real messaging integration. |

## Subscription registry

`IEventSubscriptionRegistry` is the advanced management boundary. Its mutation APIs accept a `CancellationToken`:

- `SubscribeAsync(...)` creates one active subscription.
- `SubscribeBatchAsync(...)` creates entries sequentially and rolls back entries already created by that call before propagating a later failure. Observer notifications are not atomically hidden during creation.
- `UnsubscribeAsync(...)` removes one subscription.
- `UnsubscribeBatchAsync(...)` attempts all requested IDs and reports failures after the remaining removals have been processed.
- Predicate-, event-type-, handler-type-, and service-key-based removal methods follow the same cancellable contract.

The registry remains observable through its existing `IObservable<EventSubscriptionChange>` contract. Provider shutdown remains responsible for its final external cleanup; application code should not infer external broker state from an in-memory registry notification alone.

## Module dependencies

EventBus composes the [Execution Pipeline](../execution-pipeline/index.md). Its handlers enter that pipeline through EventBus-owned adapters, which establish the delivery boundary exactly once.
