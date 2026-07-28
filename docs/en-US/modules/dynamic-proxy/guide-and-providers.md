---
title: Guide and Proxy Kinds
description: Select intercepted registrations, choose interface or class proxies, and use the optional pipeline bridge.
sidebar_position: 4
---

# Guide and Proxy Kinds

DynamicProxy currently uses its built-in Castle integration. The public choices are the registrations to intercept and whether each service uses an interface or class proxy.

## Guide methods

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `AddInterceptor<TInterceptor>(Func<ProxyBuildContext, bool>, string?)` | Registers a transient interceptor and selects service registrations. | Yes for custom interception | Logging, diagnostics, compatibility, or another intentional method-level concern. |
| `SetProxyKindOfServiceType<TServiceType>(EDynamicProxyKind)` | Overrides the default proxy kind for one service type. | No | Make proxy requirements explicit or select an interface proxy. |
| `UseExecutionPipeline(Func<ProxyBuildContext, bool>)` | Adds the shared-pipeline interceptor to selected asynchronous services. | No | Compatibility for service models with no native adapter. |

The optional `secondKey` on `AddInterceptor(...)` gives repeated module configuration a stable secondary identity. Most application registrations can omit it.

## Interface proxy

Use `InterfaceProxy` when consumers resolve an interface:

- the target implementation may be sealed;
- methods do not need to be virtual;
- only calls made through the exposed interface are intercepted.

This is the default when `ProxyBuildContext.ServiceType` is an interface.

## Class proxy

Use `ClassProxy` when consumers resolve the concrete service:

- the implementation must be non-sealed;
- every intercepted member must be virtual, abstract, or an override that remains virtual;
- mutable field state on a class proxy and a separate target instance can diverge for factory or instance registrations.

Enable `EnableClassProxyTargetStateWarning` while diagnosing stateful class-proxy registrations. Do not treat the warning as proof of a defect; stateless factory-registered services can be safe.

## Execution Pipeline compatibility bridge

`UseExecutionPipeline(...)`:

- handles `Task` and `Task<T>` methods;
- lets synchronous and `ValueTask` methods continue directly;
- marks bridged calls as business operations with `ExecutionTransactionMode.Automatic`;
- resolves `IExecutionPipeline` from the invocation's existing scope;
- rejects singleton registrations;
- excludes pipeline/proxy infrastructure and contracts implementing `IExecutionAdapterOwnedComponent`.

```csharp
builder.Services.AddScoped<ILegacyPricingService, LegacyPricingService>();

builder.AddMonica(monica =>
{
    monica.AddDynamicProxy()
        .UseExecutionPipeline(
            context => context.ServiceType == typeof(ILegacyPricingService));
});
```

The bridge registers the Execution Pipeline dependency automatically. It does not make DynamicProxy a dependency of the pipeline.

Prefer the subsystem's native adapter because it knows the correct boundary input, result, cancellation, features, and transaction mode. The bridge is for application service models that lack such an adapter.
