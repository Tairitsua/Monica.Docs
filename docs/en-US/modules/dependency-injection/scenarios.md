---
title: Scenarios
description: Apply conventional registration while keeping service lifetime and exposure explicit.
sidebar_position: 5
---

## Scenario 1 — Use lifetime markers for conventional registration

In most business modules, declare registration intent with `ITransientDependency`, `IScopedDependency`, or `ISingletonDependency`. This keeps the service definition and its lifetime together instead of repeating `services.AddScoped(...)` calls in every host.

## Scenario 2 — Use explicit exposure rules when the contract is narrower

When an implementation should be available only through selected interfaces or a keyed service, keep its lifetime marker and add `ExposeServicesAttribute` or `ExposeKeyedServiceAttribute`.

## Scenario 3 — Preserve container-owned activation

Resolve conventionally registered implementations through Monica DI rather than constructing them directly. When a subsystem exposes the same implementation through an additional contract, that contract should resolve the canonical concrete registration instead of creating a second activation path. This preserves configured lifetime, replacement rules, keyed exposure, and `ICachedServiceProvider` initialization.

Authorization, Unit of Work, EventBus, Mediator, MVC, and job behaviors run through subsystem-owned adapters and the shared [Execution Pipeline](../execution-pipeline/index.md). Conventional registration should not acquire method-interception responsibilities to apply those behaviors.

## Common mistakes

- Constructing a conventionally registered service with `new`, which bypasses Monica registration and `ICachedServiceProvider` initialization.
- Assuming every discovered type is registered without a lifetime marker or explicit registration rule.
- Registering one implementation independently through multiple contracts and unintentionally creating multiple activation paths.
- Testing registration-dependent behavior with a raw unit fixture that does not compose the production module graph.

Use a complete Monica test host for composition behavior. See [Testing Monica applications](../../guides/testing-monica-applications.md).
