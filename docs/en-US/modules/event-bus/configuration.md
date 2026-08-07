---
title: Configuration
description: Configure EventBus handler discovery and understand its startup ownership boundary.
sidebar_position: 3
---

## Module options

| Property | Type | Default | Required | Change it when | Notes |
|---|---|---|---|---|---|
| `DisableAutoDiscovery` | `bool` | `false` | No | The host creates and removes every subscription explicitly. | When `false`, Monica collects concrete local and distributed handler implementations during composition and activates them during host startup. |

## Startup and shutdown ownership

The module-owned lifecycle creates one rollback-protected batch from the auto-discovery catalog. It records only the subscription IDs produced by that batch.

- Cancellation or failure during startup rolls back the created batch.
- Shutdown removes owned IDs in reverse order and attempts every removal.
- Manual subscriptions created through `IEventSubscriptionRegistry` are not removed by the auto-discovery lifecycle.
- A cancelled early shutdown receives a final idempotent cleanup attempt after providers have stopped.

These rules let application code own long-lived manual subscriptions independently from Monica's handler-discovery lifecycle.

Batch creation is sequential and registry observers can see each subscription notification as it occurs. The transaction guarantee applies to the final registry outcome: when a later entry fails, EventBus removes entries already created by that call before propagating the error.
