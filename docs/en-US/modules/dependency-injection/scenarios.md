---
title: Scenarios
description: Apply conventional registration while keeping service lifetime and exposure explicit.
sidebar_position: 5
---

# Scenarios

## Scenario 1 — Use lifetime markers for conventional registration

In most business modules, declare registration intent with `ITransientDependency`, `IScopedDependency`, or `ISingletonDependency`. This keeps the service definition and its lifetime together instead of repeating `services.AddScoped(...)` calls in every host.

## Scenario 2 — Use explicit exposure rules when the contract is narrower

When an implementation should be available only through selected interfaces or a keyed service, keep its lifetime marker and add `ExposeServicesAttribute` or `ExposeKeyedServiceAttribute`.

## Scenario 3 — Add interception as a separate decision

Conventional registration and method interception solve different problems. Register the service here first. If a selected application service genuinely needs method-level interception and no subsystem adapter owns that boundary, compose the separate [DynamicProxy module](../dynamic-proxy/index.md). Do not enable it merely to obtain Monica's built-in authorization, Unit of Work, EventBus, Mediator, MVC, or job behaviors; those use the shared [Execution Pipeline](../execution-pipeline/index.md).

## Common mistakes

- Constructing a conventionally registered service with `new`, which bypasses Monica registration and `ICachedServiceProvider` initialization.
- Assuming every discovered type is registered without a lifetime marker or explicit registration rule.
- Assuming `AddDependencyInjection()` also enables DynamicProxy.
- Testing registration-dependent behavior with a raw unit fixture that does not compose the production module graph.

Use a complete Monica test host for composition behavior. See [Testing Monica applications](../../guides/testing-monica-applications.md).
