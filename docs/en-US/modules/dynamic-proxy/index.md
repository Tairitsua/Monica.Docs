---
title: DynamicProxy
description: Add explicit Castle-backed interception to selected Monica service registrations.
sidebar_position: 1
---

# DynamicProxy

DynamicProxy is an optional module in `Monica.DependencyInjection`. It rewrites explicitly selected dependency-injection registrations into interface or class proxies and runs application-defined `InvocationInterceptor` implementations around method calls.

## When to use this module

- A cross-cutting concern genuinely needs method-level interception on an application service.
- A legacy asynchronous service boundary needs the optional Execution Pipeline compatibility bridge.
- An interface contract should be intercepted without requiring an inheritable implementation.

Do not add DynamicProxy merely because a Monica subsystem uses the shared Execution Pipeline. Mediator, AutoControllers, EventBus, JobScheduler, Seeder, and hosted-service contracts have native adapters and do not depend on DynamicProxy.

## Package and registration

| Item | Value |
|---|---|
| Package | `Monica.DependencyInjection` |
| Registration | `monica.AddDynamicProxy()` |
| Related UI module | None |

`AddDynamicProxy()` does not make every service proxied. The host must add an interceptor or the narrow pipeline bridge and provide a `ProxyBuildContext` predicate that selects registrations.

## Public surface

| API | Purpose |
|---|---|
| `ModuleDynamicProxyGuide.AddInterceptor<TInterceptor>(...)` | Registers one interceptor and selects service registrations. |
| `SetProxyKindOfServiceType<TServiceType>(...)` | Overrides interface/class proxy selection for a service type. |
| `UseExecutionPipeline(...)` | Routes selected `Task` and `Task<T>` methods through the shared pipeline. |
| `InvocationInterceptor` | Base class for application interceptors. |
| `IMethodInvocation` | Exposes method metadata, arguments, target, return value, and `ProceedAsync()`. |
| `ProxyBuildContext` | Describes the DI registration while the host decides whether to proxy it. |
| `EDynamicProxyKind` | Selects `InterfaceProxy` or `ClassProxy`. |

## Separate from the Execution Pipeline

The two modules solve different problems:

- The [Execution Pipeline](../execution-pipeline/index.md) is the common typed boundary model in `Monica.Core`.
- DynamicProxy is optional service-method interception in `Monica.DependencyInjection`.

Prefer the native subsystem adapter whenever one exists. Use `UseExecutionPipeline(...)` only to bridge a selected service model that has no native adapter.

## Related pages

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Proxy Kinds](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [Execution boundaries](../../concepts/execution-boundaries.md)
- [Dependency Injection](../dependency-injection/index.md)
