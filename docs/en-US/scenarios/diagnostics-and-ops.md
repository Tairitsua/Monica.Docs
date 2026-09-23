---
title: Diagnostics and operations surfaces
description: Compose module diagnostics, current-host health, and Seeder run evidence with explicit access boundaries.
sidebar_position: 2
---

Monica separates operational evidence from its presentation. Health Check and Seeder runtime registration belongs in every environment; the interactive pages are Development-first and share one shell-level authorization boundary with optional page overrides.

## Compose runtime evidence and pages

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    // Runtime contracts: keep these outside Development/Aspire-only conditions.
    monica.AddHealthCheck();
    monica.AddSeeder();

    // Presentation contracts: expose only where operators should have access.
    monica.AddUIShell();
    monica.AddModuleSystemUI();
    monica.AddHealthCheckUI();
    monica.AddSeederUI();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

The three pages are read-only and available automatically in Development:

| Surface | Route | Evidence | Refresh behavior |
|---|---|---|---|
| Module System | `/module-system-dashboard` | Immutable composition, topology, discovery, timing, and bounded options. | Every second while composition is live, then stops. |
| Health Check | `/health-checks` | Newly executed, sanitized health snapshot for the current host. | Every ten seconds plus manual refresh. |
| Seeder | `/seeders` | Current process's one-run graph, policy, timing, attempts, and failures. | Every second while waiting, running, or aborting, then stops. |

The platform probes `/health` and `/alive` are separate anonymous runtime endpoints. Disabling or protecting the Health Check page does not remove or secure those probes.

## Health Check operations

`AddHealthCheck()` maps readiness and liveness in every web environment. Register application checks with `AddMonicaReadinessCheck<T>()` or `AddMonicaLivenessCheck<T>()`; do not make production readiness depend on a Development-only `AddServiceDefaults()` call. The dashboard shows readiness, aggregate counts, search, status/tag filters, durations, bounded data, and bounded errors. It represents only the host serving the current Blazor circuit and creates no durable history.

See [observability and diagnostics](/skills/monica-infra-observability) for probe semantics and dashboard behavior.

## Seeder operations

`AddSeeder()` discovers and validates the graph, starts it after `ApplicationStarted`, and contributes `monica.seeder` to readiness. Independent nodes are concurrent by default. `ContinueAndRecord` blocks only the failed dependency chain and preserves independent work; `FailFast` activates after retries are exhausted, cancels and drains the run, leaves the host alive, and keeps readiness unhealthy.

The dashboard shows effective module configuration, run progress, policy origins, dependencies, attempt history, and bounded failure evidence. It is intentionally read-only and current-process only.

See [jobs and seeding](/skills/monica-infra-jobs) for scheduling policy and the page contract.

## Module System workbench

`AddModuleSystemUI()` requires Core diagnostics, localization, and the shared UI shell through the module graph. It observes the immutable diagnostics snapshot and cannot enable, disable, or reconfigure modules at runtime.

## Sections

The selected section and module are deep-linkable through the path and `module` query parameter.

| Section | URL | Use it for |
|---|---|---|
| Overview | `/module-system-dashboard` | Composition outcome, exact KPIs, findings, hotspots, and the selectable critical path. |
| Performance | `/module-system-dashboard/performance` | Interactive waterfall, blocking chain, startup work, top contributors, and the five type-discovery stages. |
| Modules | `/module-system-dashboard/modules` | Searchable and faceted module catalog, cost bars, dependencies, bounded options, and errors. |
| Dependencies | `/module-system-dashboard/dependencies` | Selected-module neighborhood or the explicit full-host graph, with a table alternative. |
| Discovery | `/module-system-dashboard/discovery` | Query contributions, scan policy, failures and partial loads, and the lazy assembly inventory. |

While composition is still live, the page refreshes once per second. It stops immediately when the snapshot becomes final. Refresh keeps the previous data visible, and stale request completions cannot replace newer state.

## Correct performance interpretation

The workbench reports measurements, not an arbitrary efficiency or health score. Structural outcome is `Succeeded`, `Degraded`, or `Failed`. Performance warnings appear only when the host configured the corresponding `ModuleStartupPerformanceBudgets` value.

The waterfall distinguishes system stages, serial lifecycle callbacks, registration contributions, type-discovery commits, startup-work execution, queue time, and barrier waiting. Selecting a ribbon or interval synchronizes the relevant timeline evidence and module context. By default the contributor list shows the top 10 entries at or above 1 ms and hides zero-duration rows; those limits can be removed.

## Dependency graph

The graph shows direct dependency edges from the compiled graph. Dependency depth is the longest dependency path, not a breadth or arbitrary level. The default neighborhood keeps the selected module, its direct dependencies, and its direct dependents readable; switch explicitly to the full-host overview when you need the complete topology. Keyboard and constrained layouts can use the table representation instead.

## Assembly and type-discovery analysis

Opening Discovery loads the assembly inventory lazily. Failures and partial type loads are shown first; the remaining inventory is searchable, paged, collapsed by default, and contained in its own scroller. Outcomes distinguish scanned, excluded, resolution failed, partial type load, and resolved-but-not-scanned assemblies instead of inferring “missing runtime DLLs.”

The stage summary separates:

1. plan declaration;
2. assembly resolution;
3. type enumeration;
4. distinct-query evaluation; and
5. registration commit.

This prevents a discovery commit or startup-work commit from looking like a second compiler pass.

## Option catalog and sensitive debugging

Module options load only when the module drawer's configuration section is opened. Every public, non-indexed property is listed by name and clean type so an omitted value cannot make a module appear to have fewer settings than it actually defines. Values and nested traversal are bounded; unsupported or failed getters remain visible as metadata.

Ordinary values are visible by default. Sensitive properties—identified by `[ModuleOptionDiagnosticsSensitive]`, host `MarkSensitive(...)` rules, or built-in credential classification—show only presence state.

For a dedicated local debugging session, the host may reveal bounded sensitive scalars:

```csharp
using Monica.Core.Modularity.Diagnostics.Models;

builder.AddMonica(monica =>
{
    monica.ConfigureModuleSystem(options =>
    {
        options.OptionDiagnosticsExposureMode =
            ModuleOptionDiagnosticsExposureMode.RevealSensitive;
    });

    monica.AddModuleSystemUI();
});
```

`RevealSensitive` is rejected outside Development. It may expose credentials, tokens, connection strings, or private endpoints in the live page, so do not share screenshots or recordings. Portable exports omit option diagnostics in every mode.

## Baseline comparison

Export creates a sanitized client-owned JSON baseline. Importing a baseline with the same schema version overlays timing spans and reports timing deltas plus module and direct-edge changes. A different or structurally invalid schema is rejected with a localized error. No server-side history or persistence is created.

Exports omit:

- option diagnostics and revealed values;
- assembly paths;
- stack traces; and
- raw exception details.

## Production access

Outside Development, protected operational surfaces fail closed unless they can evaluate an effective named host authorization policy. Configure the common policy once on the shell:

```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("SystemDiagnostics", policy =>
        policy.RequireRole("Operations"));
});

builder.AddMonica(monica =>
{
    monica.AddUIShell(options =>
    {
        options.OperationalPageAccess.AuthorizationPolicy = "SystemDiagnostics";
    });
    monica.AddModuleSystemUI();
    monica.AddHealthCheckUI();
    monica.AddSeederUI();
});
```

Module System, Health Check, Seeder, and protected provider-option diagnostics inherit the shell policy. Set `AuthorizationPolicyOverride` on one page's module options only when it needs a different policy; blank overrides continue to inherit the global value.

For an explicitly isolated diagnostic host, the shell can instead bypass authorization:

```csharp
monica.AddUIShell(options =>
{
    options.OperationalPageAccess.DebugMode = true;
});
```

Debug mode wins over every global policy and page override in every environment, and Monica emits a startup warning. It is independent from `ModuleShellUIOption.EnableDebug`, which controls detailed Blazor and SignalR errors. Do not enable the authorization bypass on a production-reachable host unless the host is deliberately isolated and the disclosure risk is accepted.

Every page still rechecks access before its facade boundary. When Debug mode is off, a missing policy, missing authorization service, unknown policy, exception, or denied user hides protected navigation and prevents the diagnostics request. Keep authentication, HTTPS, network isolation, and least-privilege authorization in place; topology, component names, timing, and bounded errors remain operationally sensitive even when credential-like values and stack traces are withheld.

For programmatic access, continue with [Core composition diagnostics](/skills/monica-infra-hosting), [Health Check diagnostics](/skills/monica-infra-observability), and [Seeder diagnostics](/skills/monica-infra-jobs).
