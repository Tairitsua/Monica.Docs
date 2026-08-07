---
title: Core composition
description: Compose, validate, observe, and start one host-owned Monica module graph.
sidebar_position: 1
---

`Monica.Core` provides the composition boundary shared by every Monica application. One `AddMonica(...)` callback records the application identity, module-system policy, type-discovery scope, modules, options, dependencies, and explicit feature selections for one host. Monica validates and seals that graph before the host can build its service provider.

## Install and compose

```bash
dotnet add package Monica.Core --prerelease
```

```csharp
using Monica.Core;
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.ConfigureApplication(options =>
    {
        options.AppId = "orders";
        options.AppName = "Orders";
    });

    monica.ConfigureModuleSystem(options =>
    {
        options.DefaultApiGroupName = "Orders";
        options.EnableSummaryLog = true;
    });

    monica.AddMediator();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

`UseMonica()` applies module middleware. `MapMonica()` maps module-owned endpoints. A Web Host calls each method exactly once, in that order, on the same application. Generic Hosts call neither method and register only modules that can operate without a Web adapter.

## Shared configuration

| Entry point | Purpose | Important default |
|---|---|---|
| `ConfigureApplication(...)` | Sets `ProjectName`, `AppId`, `AppName`, `AppVersion`, and `DomainName` fallbacks. | Project name and version are inferred from the entry assembly when possible. |
| `ConfigureModuleSystem(...)` | Controls startup scheduling, logging, endpoint defaults, diagnostics disclosure, and optional performance budgets. | Registration errors fail startup; Minimal APIs are disabled unless a module opts in. |
| `ConfigureTypeDiscovery(...)` | Replaces the assembly inclusion and exclusion policy used by structural type discovery. | Default project assemblies are included. |

### Module-system options

| Option | Default | Purpose |
|---|---|---|
| `MaxConcurrentStartupWorkItems` | `Math.Max(1, Environment.ProcessorCount)` | Bounds scheduled startup work without making module callbacks concurrent. |
| `StartupPerformanceBudgets` | `null` | Adds explicit warning thresholds for measured startup durations. Unset measurements have no implied score or threshold. |
| `DefaultLogLevel` | `Information` | Sets the default module registration log level. |
| `EnableSummaryLog` | `false` | Emits a factual composition summary after initialization. |
| `DefaultApiGroupName` | `null` | Supplies a fallback API group for endpoint modules. |
| `EnableMinimalApiByDefault` | `false` | Supplies the host default; individual module options may override it. |
| `MonicaEndpointPort` | `null` | Restricts Monica-owned endpoints to one local port when configured. |
| `AutoAddMonicaHttpListener` | `true` | Adds a matching HTTP listener for common single-process hosts when a Monica port is configured. |
| `MonicaEndpointHost` | derived | Overrides the host used by the automatically added listener. |
| `OptionDiagnosticsExposureMode` | `Redacted` | Shows bounded ordinary option values and protects sensitive values. `RevealSensitive` is accepted only in Development. |

Performance budgets are opt-in and independent:

```csharp
monica.ConfigureModuleSystem(options =>
{
    options.StartupPerformanceBudgets = new ModuleStartupPerformanceBudgets
    {
        TotalComposition = TimeSpan.FromSeconds(2),
        ServiceRegistration = TimeSpan.FromSeconds(1),
        TypeDiscovery = TimeSpan.FromMilliseconds(500),
        AggregateBarrierWait = TimeSpan.FromMilliseconds(250),
        LongestModuleCallback = TimeSpan.FromMilliseconds(100),
        LongestStartupQueue = TimeSpan.FromMilliseconds(100)
    };
});
```

An exceeded configured budget produces a warning finding and an actual/limit/utilization evaluation. With no budgets, Monica reports measurements without inventing a “healthy” score.

## Immutable diagnostics facade

Add the diagnostics module when a host or UI needs module-system observations:

```csharp
builder.AddMonica(monica =>
{
    monica.AddModuleSystem();
});
```

Inject `ModuleDiagnosticsFacade` at the host/UI boundary. Its synchronous read-only methods return `Res<T>`:

| Method | Result |
|---|---|
| `GetSnapshot()` | One versioned immutable snapshot with composition identity, revision, outcome, timings, spans, discovery metrics, modules, direct dependency edges, blocking chains, and structured findings. |
| `GetAssemblyInventory()` | A separately lazy, cached inventory of scan successes, exclusions, resolution failures, and partial type loads. |
| `GetModuleOptions(moduleKey)` | A detached, bounded catalog of every public option property for a module's finalized default options. |
| `GetModuleOptions(moduleKey, selector)` | The same catalog for an exact named profile with explicit fallback behavior. |
| `CreateExport()` | A portable sanitized baseline for client-owned comparison. |

Registry, profiler, and startup-scheduler state are captured consistently, then projected outside their short locks. Snapshots are cached by revision; after startup reaches a final state, repeated calls return the same snapshot instance.

Portable exports never contain option diagnostics, assembly paths, stack traces, or raw exception details. Consumers display localized text for stable finding codes and arguments.

## Option diagnostics and sensitive values

Every public, non-indexed option property remains visible by name and clean type. Ordinary scalar values, object groups, and collection samples are bounded. Getter failures and unsupported runtime shapes remain represented as metadata instead of breaking the snapshot.

Sensitive values are redacted to presence state by default. Mark them on the option type:

```csharp
using Monica.Core.Modularity.Diagnostics.Annotations;

[ModuleOptionDiagnosticsSensitive]
public string? ApiToken { get; set; }
```

The host can add a sensitivity rule without modifying the option type:

```csharp
monica.AddModuleSystem(options =>
{
    options.ConfigureModuleOptionDiagnostics<ModulePayments, ModulePaymentsOption>(policy =>
        policy.MarkSensitive(static value => value.Provider.ApiSecret));
});
```

For dedicated local debugging only, set `OptionDiagnosticsExposureMode` to `RevealSensitive`. Monica rejects that mode outside `Development`; revealed scalars remain bounded, and exports still omit all option data.

## Type-discovery diagnostics

Modules declare structural queries once through `DeclareTypeDiscovery(...)`. Monica reports declaration, assembly resolution, type enumeration, distinct-query evaluation, and registration commit as five different stages. Diagnostics also include assembly/type/exclusion/plan/query/match/callback counts and indexed service-writer add/replace/skip results.

The assembly inventory is lazy because loading paths and scan details is useful only when investigating discovery. The main snapshot contains stage totals and query summaries without retaining compiler-owned match arrays.

## OpenTelemetry metrics

Subscribe to meter `Monica.Core.Modularity`. Terminal durations are histograms; only live counts use an observable gauge:

- `monica.module.composition.duration`
- `monica.module.service_registration.duration`
- `monica.module.type_discovery.duration`
- `monica.module.barrier_wait.duration`
- `monica.module.callback.duration`
- `monica.module.startup_work.duration`
- `monica.module.live.count`

Tags use stable low-cardinality values such as result, callback kind, phase, and measurement kind. Callback duration and startup-work execution/queue duration remain distinct.

Continue with [Host-bound module composition](../../concepts/host-bound-composition.md) for module authoring and lifecycle constraints, or [Module diagnostics workbench](../../scenarios/diagnostics-and-ops.md) for the interactive UI and access boundary.
