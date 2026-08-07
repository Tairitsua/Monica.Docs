---
title: Host-bound module composition
description: Understand Monica's frozen module graph, lifecycle, option boundaries, type discovery, and startup work.
sidebar_position: 1
---

`builder.AddMonica(monica => ...)` creates one Monica application context for one host. Module registrations, finalized options, dependency edges, type-discovery plans, startup work, runtime catalogs, and diagnostics all belong to that context. Two hosts in one process never share a mutable module registry.

## Composition lifecycle

Monica completes service composition in a fixed order:

1. The application callback records modules, option contributions, registration contributions, and host-wide policy.
2. Each module instance runs `Describe(ModuleDescriptor)` once to declare option-free hard dependencies, optional ordering edges, and required features.
3. Monica validates the graph, removes intentionally disabled modules and their hard dependents, rejects cycles or unsatisfied features, and produces one immutable compiled graph.
4. Default options and named profiles are bound, finalized, and validated in dependency-first order.
5. Every active module runs `DeclareTypeDiscovery(...)` once before Monica mutates the host. Monica discards plans with no registrations, resolves assemblies, enumerates types once, and evaluates distinct structural queries. A non-empty query remains scheduled for commit even when it matches zero types.
6. Monica registers its core services, then `ConfigureBuilder` and `ConfigureServices` callbacks run serially in graph order. Registration extensions may contribute callbacks before or after the module callback without changing graph ownership.
7. Monica reaches the `BeforeTypeDiscovery` startup-work barrier and commits the already compiled discovery matches serially. It then reaches `BeforePostConfigureServices`, runs `PostConfigureServices`, closes submissions, and drains `BeforeServiceRegistrationCompletion` work before `AddMonica(...)` returns.
8. A Generic Host is composition-complete. A Web Host completes only after `UseMonica()` applies middleware and `MapMonica()` maps endpoints on the same application instance.

The application callback and every `ModuleRegistration<,>` returned from it are recording surfaces, not runtime objects. Monica seals the graph when the callback finishes; do not retain a registration and mutate it later.

## Module shape

A module has one strategy type and one startup-frozen option type:

```csharp
public sealed class ModuleAnalyticsOption : ModuleOptions<ModuleAnalytics>
{
    public bool EnableDetailedMetrics { get; set; }
}

public sealed class ModuleAnalytics : MonicaModule<ModuleAnalyticsOption>
{
    public override void Describe(ModuleDescriptor module)
    {
        module.Require<ModuleLogging, ModuleLoggingOption>();
        module.AfterIfPresent<ModuleOpenTelemetry, ModuleOpenTelemetryOption>();
    }

    public override void ConfigureServices(ModuleContext<ModuleAnalyticsOption> context)
    {
        context.Services.AddSingleton<AnalyticsService>();
    }
}

public static class ModuleAnalyticsBuilderExtensions
{
    extension(IMonicaBuilder builder)
    {
        public ModuleRegistration<ModuleAnalytics, ModuleAnalyticsOption> AddAnalytics(
            Action<ModuleAnalyticsOption>? configure = null)
        {
            return builder.AddModule<ModuleAnalytics, ModuleAnalyticsOption>(configure);
        }
    }
}
```

Use `IWebModule` when a module can contribute middleware or endpoints but remains useful in a Generic Host. Use `IWebHostRequiredModule` only when omitting those Web contributions would make the module unusable or misleading.

## Dependencies, features, and registration contributions

`Describe(...)` owns intrinsic graph structure:

- `Require<TModule,TOptions>()` includes a hard dependency.
- `AfterIfPresent<TModule,TOptions>()` creates ordering only when the target is already included.
- `RequireFeature(name)` states that composition is invalid until an explicit registration path satisfies the feature.

Fluent `Add*`, `Use*`, `Map*`, and `Register*` methods extend `ModuleRegistration<TModule,TOptions>`. They may include or require companion modules, configure options or named profiles, contribute lifecycle callbacks, satisfy or require a feature, and record keyed-service identities. This keeps optional capability selection explicit at the composition root without introducing a separate Guide object.

Use `ModuleRegistrationOrder.BeforeModule`, `AfterModule`, or `Late` when a registration extension must place a callback around the module's own lifecycle callback. Direct service writes stay inside the owning module's `ModuleContext` or an explicit registration contribution.

## Finalized option access

The current module reads its own finalized options through protected `Option` or `context.Options`. Cross-module access is relationship checked:

- `GetOptions<TModule,TOptions>()` or `context.Modules.Get<TModule,TOptions>()` reads a directly required module.
- `TryGetOptions<TModule,TOptions>(out ...)` or `context.Modules.TryGet(...)` reads an active module named by `AfterIfPresent`.

An undeclared read fails with the source and target module relationship instead of depending on incidental callback order. Use a module-owned abstraction or contribution API when modules need to collaborate at runtime; do not turn another module's option object into a shared mutable registry.

## Centralized type discovery

Override `DeclareTypeDiscovery(TypeDiscoveryPlan<TOptions> discovery)` and add structural queries with `discovery.Match(query, commit)`. Query evaluation is analysis-only. The commit receives a bounded `TypeDiscoveryContext<TOptions>`, immutable matches, and the indexed `ModuleServiceRegistrationWriter`; it does not receive the raw service collection.

The diagnostics timeline records five factual system stages:

1. `TypeDiscoveryPlanDeclaration`
2. `TypeDiscoveryAssemblyResolution`
3. `TypeDiscoveryTypeEnumeration`
4. `TypeDiscoveryQueryEvaluation`
5. `TypeDiscoveryRegistrationCommit`

When at least one non-empty discovery plan exists, assemblies and types are enumerated once during host composition; repeated diagnostics snapshots never rescan them. Identical queries are evaluated once, and compiler-owned match references are released after registration succeeds or fails. A startup-work commit keeps its origin phase and is never reported as another discovery compilation.

## Scheduled startup work

`MonicaModule.ScheduleStartupWork(...)` starts isolated synchronous work on Monica's bounded scheduler. The overload with a `commit` callback performs expensive work concurrently and applies the result through a deterministic serial commit.

Choose the latest barrier that still protects the first consumer:

| Barrier | Contract |
|---|---|
| `BeforeTypeDiscovery` | Required before compiled type-discovery matches are committed to service registration. |
| `BeforePostConfigureServices` | Required before post-service configuration starts. |
| `BeforeServiceRegistrationCompletion` | Required before `AddMonica(...)` returns. This is the default. |
| `BeforeHostLifecycle` | Required before any Generic Host lifecycle participant starts. |
| `NoBarrier` | Does not delay composition or host readiness; failure is diagnostic-only, and Monica owns the work until completion or host disposal. |

The work action must be synchronous, deterministic, CPU-bound, and isolated from the host builder, `IServiceCollection`, service providers, the module graph, and shared mutable state. Use hosted services for I/O, continuous activity, runtime activation, and cleanup.

`MaxConcurrentStartupWorkItems` controls scheduler concurrency. A value of `1` preserves the barrier model while serializing startup work; non-blocking work cannot occupy the only lane while required submissions remain open.

## Web completion boundary

Call `UseMonica()` and then `MapMonica()` exactly once on the same `WebApplication`. Missing, repeated, reversed, or cross-application calls are rejected. A Web Host that starts before composition is complete fails before hosted lifecycle participants run. Generic Hosts call neither method and may include only modules that can operate without the Web adapter.

Use `MonicaTestApplicationFactory<TDiscoveryAnchor>` when a test must exercise this complete boundary, including graph validation, finalized options, type discovery, service registration, and host lifecycle.

Continue with [Options and registration extensions](./configuration-and-guide.md) for the public configuration surface, [Core composition](../modules/core-composition/index.md) for host policy and diagnostics, or [Testing Monica applications](../guides/testing-monica-applications.md) for host-backed test patterns.
