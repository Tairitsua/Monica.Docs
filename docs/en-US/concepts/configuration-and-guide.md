---
title: Options and registration extensions
description: Choose between module options, fluent registration extensions, named profiles, and required features.
sidebar_position: 2
---

Monica separates startup-frozen configuration values from actions that change the module graph or register a capability.

## Use `ModuleOptions<TModule>` for values

An option property should be public, stable, understandable without knowing the implementation, and have a documented default. Typical examples include feature switches, limits, route prefixes, and retry or batching policy.

```csharp
public sealed class ModuleAnalyticsOption : ModuleOptions<ModuleAnalytics>
{
    public bool EnableDetailedMetrics { get; set; }

    public int BatchSize { get; set; } = 100;
}
```

Configure the option through the module's `Add*` callback. Monica applies dependency- and feature-owned defaults first, then host-owned contributions, preserving the recorded order inside each band. A host's direct configuration therefore wins over transitive defaults regardless of the order in which dependencies were discovered. Monica then finalizes the option and calls `ValidateOptions(...)` before mutating the host builder or service collection.

Use `ConfigureProfile(name, ...)` when one module owns several keyed provider instances with startup-frozen named options. A profile is explicit configuration, not a mutable runtime settings bag.

## Use registration extensions for capabilities

An `Add*`, `Use*`, `Map*`, or `Register*` extension on `ModuleRegistration<TModule,TOptions>` is appropriate when the action:

- includes or requires another module;
- chooses one provider implementation;
- records keyed service identity;
- contributes services, middleware, or endpoints;
- satisfies a required feature; or
- needs a dedicated configuration object that does not belong in the primary option type.

Examples include `UseInMemoryMetadataRepository()`, `UseSchedulerScope("local-dev")`, `MapSignalRHub<THub>(...)`, and `UseSetup<TSetup>()`.

Registration extensions remain valid only inside the enclosing `AddMonica(...)` callback. The returned registration is sealed with the graph and must not be stored for later mutation.

## Required features

An intrinsic module contract declares `module.RequireFeature("feature-name")` in `Describe(...)`. An optional fluent path may instead call `registration.RequireFeature(...)`. The concrete provider or capability extension calls `SatisfyFeature(...)` only after it has recorded the corresponding registration.

Validation is order independent: satisfying an undeclared feature is an error, and leaving a declared feature unsatisfied is also an error. This makes a required provider choice visible in the composition root instead of selecting a hidden default.

## Cross-module option reads

Module callbacks read their own finalized values through `Option` or `context.Options`. They may read only declared relationships:

- a direct hard dependency through `GetOptions` or `context.Modules.Get`;
- an active optional ordering target through `TryGetOptions` or `context.Modules.TryGet`.

If one module needs to extend another module's runtime behavior, prefer an owner-defined registration or abstraction. Do not expose the other module's mutable option object as a general-purpose registry.

## Option diagnostics

The diagnostics catalog represents every public option property by name and clean type. Ordinary bounded values are visible; only sensitive values are redacted. Mark a sensitive property with `[ModuleOptionDiagnosticsSensitive]`, or add a host rule with `ConfigureModuleOptionDiagnostics(...).MarkSensitive(...)` when the option type cannot be changed.

This visibility rule is diagnostic only. It does not make finalized options mutable and does not include option data in portable exports.
