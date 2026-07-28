---
title: Scenarios
description: Apply conventional registration and dynamic proxies without hiding activation constraints.
sidebar_position: 5
---

# Scenarios

## Scenario 1 — Use lifetime markers for conventional registration

In most business modules, declare registration intent with `ITransientDependency`, `IScopedDependency`, or `ISingletonDependency`. This keeps the service definition and its lifetime together instead of repeating `services.AddScoped(...)` calls in every host.

## Scenario 2 — Use explicit exposure rules when the contract is narrower

When an implementation should be available only through selected interfaces or a keyed service, keep its lifetime marker and add `ExposeServicesAttribute` or `ExposeKeyedServiceAttribute`. The exposed service type also determines the default dynamic-proxy kind: interface service types use an interface proxy, while concrete service types use a class proxy.

## Scenario 3 — Intercept a concrete service with a class proxy

`AddInterceptor<TInterceptor>(...)` evaluates each service registration through `ProxyBuildContext`. When its predicate selects a concrete service, DynamicProxy creates a Castle class proxy that derives from the implementation type.

A class-proxy target therefore has two requirements:

- the implementation class must be inheritable, so it cannot be `sealed`;
- each member whose invocation must be intercepted must be `virtual`, `abstract`, or an override that remains virtual.

These requirements apply only to registrations selected for a class proxy. Ordinary conventionally registered services and EventBus handlers may remain sealed when no class-proxy interceptor applies to them.

If a selected implementation is sealed, Monica rejects the registration while composing the DynamicProxy module. The diagnostic identifies the service and implementation types and explains the available corrections. This prevents a delayed Castle `TypeLoadException` when the service is first resolved.

Choose the correction that preserves the intended behavior:

1. Make the implementation inheritable and keep the intercepted members virtual when class interception is required.
2. Expose the service through an interface and use `InterfaceProxy` when interception belongs to the interface contract. An interface proxy wraps the target instead of deriving from its implementation.
3. Narrow the `AddInterceptor` predicate so it excludes the registration only when that interceptor is not required for the service.

Do not exclude a service merely to make startup succeed if the interceptor supplies required transaction, authorization, or other correctness behavior.

## Common mistakes

- Constructing a conventionally registered service with `new`, which bypasses Monica registration and `ICachedServiceProvider` initialization.
- Assuming every discovered type is registered without a lifetime marker or explicit registration rule.
- Making a class inheritable but leaving the method that needs interception non-virtual.
- Testing proxy-dependent behavior with a raw unit fixture that does not compose DynamicProxy.

Use a complete Monica test host for proxy behavior. See [Testing Monica applications](../../guides/testing-monica-applications.md).
