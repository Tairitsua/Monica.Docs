---
title: Scenarios
description: Compose local and distributed handlers, class-proxy interception, and delivery troubleshooting.
sidebar_position: 5
---

# Scenarios

## Scenario 1 — Use local events for in-process collaboration

When an event is consumed only inside the current process, `monica.AddEventBus()` is sufficient. Handlers are discovered and subscribed during startup, and publishers can use `IEventBus.PublishAsync<TEvent>()` without depending on a distributed provider.

## Scenario 2 — Provide a keyed event bus to another module

When a module needs an event bus under its own service key, compose it through `AddKeyedEventBus(...)` or `AddKeyedLocalEventBus(...)`. Do not bypass EventBus by building a separate service container.

## Scenario 3 — Optionally combine a handler with a custom DynamicProxy interceptor

EventBus handlers already enter the shared execution pipeline through the EventBus adapter. Authorization, Unit of Work, diagnostics, routing, and application execution behaviors therefore do not require DynamicProxy. The pipeline bridge explicitly excludes adapter-owned handlers to prevent duplicate execution.

EventBus discovery accepts concrete `ILocalEventHandler<TEvent>` and `IDistributedEventHandler<TEvent>` implementations whether or not they are sealed. A separate constraint appears only when the host configures a custom DynamicProxy interceptor and its predicate selects a handler registered as its concrete type.

Castle implements that class proxy by deriving from the handler. The handler class must therefore be inheritable, and `HandleEventAsync` must remain virtual. Handlers derived from Monica's abstract handler bases already override an abstract method; keep the concrete handler non-sealed when a class-proxy interceptor applies.

Auto-discovered EventBus handlers are resolved by their concrete handler type. A selected handler therefore uses a class proxy and must remain inheritable. If custom interception is not required, narrow the interceptor predicate instead. `InterfaceProxy` remains an alternative for ordinary services that are exposed and resolved through an interface, but it is not a drop-in replacement for the default EventBus auto-discovery path. See [DynamicProxy scenarios](../dynamic-proxy/scenarios.md) for the complete decision rules.

## Troubleshooting — Dapr repeatedly redelivers before the handler runs

This failure signature points to handler activation rather than event publication or a downstream SignalR client:

```text
System.TypeLoadException: Could not load type 'Castle.Proxies.SomeHandlerProxy' ...
because the parent type is sealed.
```

The message has already reached the subscribing application, but dependency injection cannot create the handler proxy. The handler body never starts, so its logs, state changes, or SignalR invocation are all absent. When the subscriber reports `RETRY`, Dapr redelivers according to the deployment's resiliency and dead-letter configuration. With an ordered broker such as Kafka, an unacknowledged record can prevent the consumer from advancing the affected partition, making later events on that partition appear to be missing too.

Diagnose the path in order:

1. Confirm that the publisher emitted the expected topic.
2. Confirm that the Dapr sidecar delivered the topic to the subscribing application.
3. Inspect application logs for handler activation or proxy-generation failures before looking inside `HandleEventAsync`.
4. If other invocations arrive over the same authenticated SignalR connection, treat the account, WebSocket route, hub, and backplane as healthy until contrary evidence appears.
5. Correct the proxy contract and redeploy; do not treat repeated delivery as a SignalR reconnection problem.

The retry interval and terminal outcome belong to the deployed Dapr component and resiliency policy, not to EventBus handler discovery.

## Test the production composition

A raw `ProjectUnitFixture<TUnit>` deliberately skips module discovery, the execution pipeline, DynamicProxy, and hosted lifecycle. It can prove handler logic but cannot prove runtime behavior composition or activation of a custom-proxied handler.

For an interception regression, build a complete Monica test host with the production module composition, resolve or dispatch to the handler, and verify the expected interceptor path. See [Testing Monica applications](../../guides/testing-monica-applications.md).

## Common mistakes

- Setting `DisableAutoDiscovery = true` and still expecting automatic handler subscriptions.
- Calling `AddKeyedEventBus(key, useDistributed: true)` without configuring a distributed provider first.
- Treating every sealed event handler as invalid even when no class-proxy interceptor selects it.
- Investigating only SignalR client code after the subscriber has already logged an activation failure.
