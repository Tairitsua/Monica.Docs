---
title: Scenarios
description: Compose local and distributed handlers, manage subscriptions, and verify production lifecycle behavior.
sidebar_position: 5
---

## Scenario 1 — Use local events for in-process collaboration

When an event is consumed only inside the current process, `monica.AddEventBus()` is sufficient. Handlers are discovered during composition and subscribed during Generic Host startup, before provider `StartAsync` runs. Publishers can use `ILocalEventBus.PublishAsync<TEvent>()` without depending on a distributed provider.

## Scenario 2 — Provide a keyed event bus to another module

When a module needs an event bus under its own service key, compose it through `AddKeyedEventBus(...)` or `AddKeyedLocalEventBus(...)`. Do not bypass EventBus by building a separate service container.

## Scenario 3 — Combine automatic and manual subscriptions

Create application-owned subscriptions through `IEventSubscriptionRegistry` after the host starts. EventBus tracks the IDs created from its auto-discovery catalog separately, so shutdown removes only those lifecycle-owned subscriptions and preserves manually registered entries.

Use `SubscribeBatchAsync(...)` when a group needs rollback protection. Entries and their observer notifications are created sequentially; if a later entry fails or startup is cancelled, subscriptions already created by that call are removed before the error is propagated. Use `UnsubscribeBatchAsync(...)` for best-effort cleanup: it attempts every requested ID and reports the collected failures afterward.

## Test the production composition

A raw `ProjectUnitFixture<TUnit>` deliberately skips module discovery, the execution pipeline, conventional registration, and hosted lifecycle. It can prove handler logic but cannot prove runtime subscription, behavior composition, or container-owned handler activation.

For an activation or delivery regression, build a complete Monica test host with the production module composition, publish or dispatch to the handler, and verify the expected lifecycle and behavior path. See [Testing Monica applications](../../guides/testing-monica-applications.md).

## Common mistakes

- Setting `DisableAutoDiscovery = true` and still expecting automatic handler subscriptions.
- Calling `AddKeyedEventBus(key, useDistributed: true)` without configuring a distributed provider first.
- Testing automatic subscription behavior only through a raw handler fixture.
