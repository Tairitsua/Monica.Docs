---
title: Module diagnostics workbench
description: Inspect startup causality, module topology, type discovery, and bounded option diagnostics safely.
sidebar_position: 2
---

`Monica.UI` includes a read-only module diagnostics workbench at `/module-system-dashboard`. It is an observability surface for the immutable diagnostics snapshot; it does not enable, disable, or reconfigure modules at runtime.

## Register the workbench

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddUIShell();
    monica.AddModuleSystemUI();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

`AddModuleSystemUI()` requires the Core diagnostics module, localization, and the shared UI shell through the module graph. In Development, the workbench is available automatically.

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

Outside Development, the secure default is disabled. Enablement requires both an explicit flag and a non-empty host authorization policy:

```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ModuleDiagnostics", policy =>
        policy.RequireRole("Operations"));
});

builder.AddMonica(monica =>
{
    monica.AddModuleSystemUI(options =>
    {
        options.EnableOutsideDevelopment = true;
        options.AuthorizationPolicy = "ModuleDiagnostics";
    });
});
```

If the policy is missing, cannot be resolved, or the current user fails it, the navigation entry is hidden and the diagnostics facade is not invoked by the page. Keep authentication, HTTPS, network isolation, and least-privilege authorization in place; the workbench can reveal internal topology and operational timing even when sensitive option values remain redacted.

For programmatic access and metrics, continue with [Core composition diagnostics](../modules/core-composition/index.md#immutable-diagnostics-facade).
