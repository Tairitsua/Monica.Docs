---
title: ProjectUnits
description: Use typed architectural roles to make application structure discoverable and enforceable.
sidebar_position: 2
---

# ProjectUnits

ProjectUnits are Monica's typed vocabulary for application architecture. They tell a developer, a coding agent, and the running host what role a type owns.

## The vocabulary

- `ApplicationService` and `RequestDto` describe use cases and their public inputs.
- `DomainService`, `Entity`, and `Repository` keep domain behavior and persistence boundaries explicit.
- `DomainEvent`, `DomainEventHandler`, and `LocalEventHandler` describe collaboration and side effects.
- `Configuration` describes owned settings.
- `RecurringJob` and `TriggeredJob` describe background work.

## Register discovery

```csharp
builder.AddMonica(monica =>
{
    monica.ConfigureTypeDiscovery(options =>
        options.Add("Domains.Ordering", "Platform.Protocol"));

    monica.AddProjectUnits(options =>
    {
        options.ConventionOptions.EnableNameConvention = true;
    });
});
```

ProjectUnits now live in the focused `Monica.ProjectUnits` package. Their catalog is host-owned and available through `IProjectUnitCatalog`; it is not a static registry.

## Host-bound service infrastructure

Monica activates its `ServiceBase`-derived ProjectUnits through dependency injection. This includes `ApplicationService`, `CustomApplicationService`, `DomainService`, `DomainEventHandler`, and `LocalEventHandler`. Their base classes provide protected `Logger` and `Mapper` properties from the host that created the service.

Keep constructors focused on business collaborators:

```csharp
public sealed class QueryHandlerGetOrders(
    IRepositoryOrder repository)
    : ApplicationService<GetOrdersRequest, IReadOnlyList<OrderDto>>
{
    public override async Task<Res<IReadOnlyList<OrderDto>>> Handle(
        GetOrdersRequest request,
        CancellationToken cancellationToken)
    {
        Logger.LogInformation("Loading active orders");
        var orders = await repository.GetListAsync(cancellationToken: cancellationToken);
        return Res.Ok<IReadOnlyList<OrderDto>>(
            orders.Select(order => Mapper.Map<OrderDto>(order)).ToList());
    }
}
```

- Do not add `ILoggerFactory` or a mapper solely to forward infrastructure into a base constructor.
- Do not construct these service types with `new`; resolve them through Monica DI.
- Do not access `Logger` or `Mapper` from a derived constructor. Host infrastructure is available after activation, including request and event handler methods.
- Classes outside these Monica service bases should continue to inject `ILogger<T>` normally.

## What discovery enables

- Naming and dependency diagnostics.
- Runtime architecture views and `/framework/units` metadata.
- Agent skills that can reason about the application in Monica's own vocabulary.
- Consistent placement and collaboration rules across bounded contexts.

ProjectUnits are not annotations for an anemic model. Keep behavior on the object that owns the state, and use services for orchestration and boundaries.

## Test ProjectUnits

Use `ProjectUnitFixture<TUnit>` only for focused collaboration tests whose dependencies are explicit. Use a complete host-owned application scenario when behavior depends on discovery, conventional registration, proxies, interceptors, options, persistence, or host lifecycle.

[Choose the correct testing boundary](../guides/testing-monica-applications.md).
