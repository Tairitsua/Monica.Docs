---
title: Scenarios
description: Choose interface proxies, validate class-proxy constraints, and bridge legacy asynchronous services.
sidebar_position: 5
---

# Scenarios

## Scenario 1 — Intercept a sealed implementation through its interface

Register and select the interface service type:

```csharp
builder.Services.AddScoped<IOrderPricingService, OrderPricingService>();

builder.AddMonica(monica =>
{
    monica.AddDynamicProxy()
        .AddInterceptor<InvocationLoggingInterceptor>(
            context => context.ServiceType == typeof(IOrderPricingService));
});

public sealed class OrderPricingService : IOrderPricingService
{
    public Task<decimal> CalculateAsync(
        Order order,
        CancellationToken cancellationToken)
    {
        return Task.FromResult(order.Total);
    }
}
```

The exposed type is an interface, so the default interface proxy wraps the sealed target. No virtual method is required.

## Scenario 2 — Intercept a concrete class

A concrete service uses a class proxy by default:

```csharp
builder.Services.AddScoped<OrderPricingService>();

builder.AddMonica(monica =>
{
    monica.AddDynamicProxy()
        .AddInterceptor<InvocationLoggingInterceptor>(
            context => context.ServiceType == typeof(OrderPricingService));
});

public class OrderPricingService
{
    public virtual Task<decimal> CalculateAsync(
        Order order,
        CancellationToken cancellationToken)
    {
        return Task.FromResult(order.Total);
    }
}
```

The class must be inheritable and the method must be virtual. Monica rejects a selected sealed class during module composition instead of deferring the failure until first resolution.

## Scenario 3 — Bridge a legacy asynchronous service

Use the narrow bridge when a scoped or transient service has no native Monica adapter but should participate in registered execution behaviors:

```csharp
builder.Services.AddScoped<ILegacyPricingService, LegacyPricingService>();

builder.AddMonica(monica =>
{
    monica.AddDynamicProxy()
        .UseExecutionPipeline(
            context => context.ServiceType == typeof(ILegacyPricingService));
});
```

Only `Task` and `Task<T>` methods enter the pipeline. A singleton is rejected because the bridge must resolve the scoped pipeline from the current invocation. Synchronous and `ValueTask` calls continue directly.

Do not use this bridge for Mediator handlers, EventBus handlers, jobs, seeders, hosted work items, or other `IExecutionAdapterOwnedComponent` contracts. Their native adapters already own execution.

## Scenario 4 — Select methods inside an interceptor

The registration predicate chooses the service, not a method. Inspect the invocation when one interceptor applies differently across the selected service:

```csharp
public override async Task InterceptAsync(IMethodInvocation invocation)
{
    if (invocation.Method.Name.StartsWith("Get", StringComparison.Ordinal))
    {
        logger.LogDebug("Reading through {Method}.", invocation.Method.Name);
    }

    await invocation.ProceedAsync();
}
```

## Common mistakes

- Assuming `AddDynamicProxy()` proxies every service without an interceptor predicate.
- Selecting a sealed concrete implementation for `ClassProxy`.
- Expecting a non-virtual concrete method to be intercepted.
- Using `UseExecutionPipeline(...)` for `ValueTask` or synchronous methods.
- Applying the compatibility bridge to a native adapter-owned contract.
- Registering a singleton with the compatibility bridge.
- Constructing the target with `new` and bypassing the proxied DI registration.
