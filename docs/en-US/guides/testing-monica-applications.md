---
title: Testing Monica applications
description: Choose between host-owned application scenarios, raw ProjectUnit fixtures, and UI component tests.
sidebar_position: 2
---

`Monica.Testing` provides two deliberately different test boundaries: a complete Monica host for runtime-aware application scenarios and a raw `ProjectUnitFixture<TUnit>` for focused collaboration tests. Choose the boundary from the behavior you need to prove, not from the class name under test.

## Choose the smallest honest boundary

| What the test must prove | Recommended boundary |
|---|---|
| Entity, value-object, or pure domain behavior | Construct the object directly. |
| One ProjectUnit collaborating with explicit substitutes | `ProjectUnitFixture<TUnit>` |
| Module composition, type discovery, execution-pipeline behaviors, options, proxies, persistence, or host lifecycle | `MonicaTestApplicationFactory<TDiscoveryAnchor>` |
| Razor component rendering and interaction | bUnit plus `Monica.Testing.UI` when Monica UI doubles are useful |

Do not use a raw fixture to claim that production composition works. Conversely, a complete host is unnecessary for a pure entity invariant.

## Install

Add the core toolkit to a test project:

```bash
dotnet add package Monica.Testing
```

Add the UI package only to UI test projects that need Monica-specific UI doubles:

```bash
dotnet add package Monica.Testing.UI
```

`Monica.Testing.UI` does not replace bUnit. It keeps UI-specific support such as `TestThemeState` out of the core testing package.

## Create a complete host-owned scenario

Derive one reusable factory that describes the production composition exercised by a test suite. The factory is a recipe; every `CreateAsync(...)` call creates, starts, and returns a new application with its own service provider, Monica module graph, singletons, and scopes.

```csharp
using Microsoft.Extensions.DependencyInjection;
using Monica.Core.Modularity.Abstractions;
using Monica.Modules;
using Monica.Testing.Hosting;

public sealed class OrdersTestApplicationFactory
    : MonicaTestApplicationFactory<QueryHandlerGetOrder>
{
    protected override void ConfigureMonica(IMonicaBuilder monica)
    {
        monica.AddWebApi();
        monica.AddProjectUnits();
    }

    protected override void ConfigureServices(IServiceCollection services)
    {
        base.ConfigureServices(services);
        services.UseTestDatabase<OrdersDbContext>();
    }
}
```

Create one application for one independently configured scenario, then resolve scoped ProjectUnits from that application:

```csharp
var gateway = Substitute.For<IOrdersGateway>();
gateway.GetAsync(42, Arg.Any<CancellationToken>())
    .Returns(new OrderSnapshot(42, "Ready"));

await using var application = await factory.CreateAsync(
    seams => seams.With<IOrdersGateway>(gateway),
    TestContext.Current.CancellationToken);

await using var scope = application.CreateScope(
    TestContext.Current.CancellationToken);

var handler = scope.Resolve<QueryHandlerGetOrder>();
var result = await handler.Handle(
    new GetOrderRequest(42),
    scope.CancellationToken);
```

Dispose scopes before their owning application. A scope resolves services from the already-built host; it never changes registrations.

## Factory hooks and ownership

| Hook | Responsibility |
|---|---|
| `ConfigureHost(WebApplicationBuilder)` | Supplies host configuration, environment inputs, or host-level services before Monica composition. |
| `TypeDiscoveryAssemblies` | Declares production assemblies Monica should scan. The discovery-anchor assembly is included by default. |
| `ConfigureMonica(IMonicaBuilder)` | Composes the production modules the scenario exercises. |
| `ConfigureServices(IServiceCollection)` | Registers stable test providers and boundary doubles after module registration and before build. Call `base.ConfigureServices(...)`. |
| `CreateAsync(configureScenario, cancellationToken)` | Applies final scenario-specific replacements before building and starting a new host. |

When a scenario spans more than one production assembly, make the discovery boundary explicit:

```csharp
protected override IEnumerable<Assembly> TypeDiscoveryAssemblies =>
[
    typeof(QueryHandlerGetOrder).Assembly,
    typeof(BillingPublishedLanguageAnchor).Assembly
];
```

Do not copy service descriptors from another built host or attach one host's `MonicaApplication` to another provider. Host ownership is the isolation boundary.

## Replace external seams before build

The scenario callback exposes only pre-build replacement operations:

| Method | Lifetime and use |
|---|---|
| `With<TService>(instance)` | Replaces the service with a scenario-owned singleton instance. |
| `With<TService>(factory)` | Replaces the service with a scoped factory. |
| `Substitute<TService>(out service)` | Creates and registers an NSubstitute singleton. |
| `WithHttpClient(name, client)` | Registers a named client for an HTTP adapter boundary. Multiple names can coexist. |

Use replacements for real external boundaries such as remote gateways, clocks, current-user context, or explicitly controlled infrastructure. Keep the application service, domain service, repository behavior, and Monica runtime path real when they are the subject of the scenario.

## Isolate persistence

Register a test database in `ConfigureServices(...)`:

```csharp
services.UseTestDatabase<OrdersDbContext>();
```

| Isolation mode | Behavior | Typical use |
|---|---|---|
| `PerScopeDatabase` | Creates a fresh SQLite in-memory database for every scope. This is the default. | Independent tests and parallel execution. |
| `SharedDatabaseWithTransaction` | Shares one host-owned SQLite database and rolls back a transaction when each scope is disposed. | Scenarios that need common seeded structure while retaining scope rollback. |
| `RealDatabase` | Requires `UseRealTestDatabase<TDbContext>(...)`; the caller selects and owns the provider and cleanup policy. | Provider-specific integration checks. |

A scope can seed the single registered repository context or resolve it explicitly:

```csharp
await scope.SeedAsync(order);
var dbContext = await scope.GetDbContextAsync<OrdersDbContext>();
```

If a scenario registers multiple repository DbContexts, resolve the intended context and seed it directly.

## Use the raw ProjectUnit fast path intentionally

`ProjectUnitFixture<TUnit>` builds a small Microsoft DI provider, supplies deterministic core seams, activates the target, and assigns Monica's cached service provider when the target supports it.

```csharp
var fixtureBuilder = ProjectUnitFixture<DomainCalculateOrderTotal>
    .Builder()
    .WithSubstitute<IPriceCatalog>(out var priceCatalog);

priceCatalog.GetUnitPriceAsync("SKU-42", Arg.Any<CancellationToken>())
    .Returns(12.50m);

await using var fixture = fixtureBuilder.Build();
var total = await fixture.Unit.CalculateAsync(
    "SKU-42",
    quantity: 2,
    TestContext.Current.CancellationToken);
```

This fast path deliberately does **not** run Monica module composition, production type discovery, the shared execution pipeline, conventional registration, options binding, or hosted lifecycle. Use a complete host as soon as the expected behavior depends on authorization, routing, Unit of Work, tracing, another execution behavior, service activation, or any other omitted runtime feature. There is no separate application-service fixture.

## Parallel execution

Independent applications are designed to run in parallel because each owns its complete runtime graph. Keep mutable doubles, database names, ports, files, queues, and other external resource identities unique per scenario. Serialize only a resource that is genuinely shared outside the application boundary.

## Related pages

- [Host-bound composition](../concepts/host-bound-composition.md)
- [Execution boundaries](../concepts/execution-boundaries.md)
- [ProjectUnits](../concepts/project-units.md)
- [Package maturity](../packages/index.md)
