---
title: Configuration
description: Configure DynamicProxy proxy kinds and class-proxy state diagnostics.
sidebar_position: 3
---

# Configuration

## `ModuleDynamicProxyOption`

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `ConfiguredProxyKinds` | `Dictionary<Type, EDynamicProxyKind>` | Empty | No | Override the proxy kind for a particular exposed service type. | Prefer `SetProxyKindOfServiceType<TServiceType>(...)` on the Guide. |
| `EnableClassProxyTargetStateWarning` | `bool` | `false` | No | Diagnose a class proxy over a factory- or instance-registered service that may hold mutable state. | The warning is intentionally opt-in because stateless Monica services registered by factory can be safe. |

```csharp
builder.AddMonica(monica =>
{
    monica.AddDynamicProxy(options =>
    {
        options.EnableClassProxyTargetStateWarning = true;
    })
    .AddInterceptor<InvocationLoggingInterceptor>(
        context => context.ServiceType == typeof(OrderPricingService));
});
```

## Default proxy-kind selection

| Exposed service type | Default kind | Requirements |
|---|---|---|
| Interface | `EDynamicProxyKind.InterfaceProxy` | The registration must expose the service through that interface. The implementation may be sealed. |
| Concrete class | `EDynamicProxyKind.ClassProxy` | The implementation must be non-sealed; intercepted methods must be virtual, abstract, or remain-overridable overrides. |

Override the default explicitly when the service contract requires it:

```csharp
monica.AddDynamicProxy()
    .SetProxyKindOfServiceType<IOrderPricingService>(
        EDynamicProxyKind.InterfaceProxy)
    .AddInterceptor<InvocationLoggingInterceptor>(
        context => context.ServiceType == typeof(IOrderPricingService));
```

`InterfaceProxy` requires `TServiceType` to be an interface. `ClassProxy` derives from the concrete implementation, so it cannot proxy a sealed class or intercept a non-virtual member.

## Registration-time predicates

Both `AddInterceptor(...)` and `UseExecutionPipeline(...)` accept `Func<ProxyBuildContext, bool>`. The context exposes:

- `ServiceDescriptor`, including its lifetime and registration form;
- `ServiceType`, the contract consumers resolve;
- `ImplementationType`, the concrete target Monica identified.

Keep predicates deterministic and based on registration metadata. They run while DynamicProxy rewrites the service collection, not for every method call.
