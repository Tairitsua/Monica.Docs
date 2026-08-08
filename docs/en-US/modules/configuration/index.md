---
title: Configuration
description: Define managed options schemas and project effective values into Microsoft configuration.
sidebar_position: 1
---

`Monica.Configuration` turns annotated options types into schemas, stores effective JSON documents, records audited mutations and history, and projects the active values back into Microsoft `IConfiguration` and the Options pattern.

## Minimal file-backed setup

```bash
dotnet add package Monica.Configuration --prerelease
```

```csharp
using Monica.Configuration.Annotations;
using Monica.Configuration.Bootstrap;
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);
var configurationInputPlan = MonicaConfigurationInputPlan.Create(inputs => inputs
    .UseFileConfigurationStore());

builder.AddMonica(monica =>
{
    monica.AddConfiguration(configurationInputPlan);
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();

[Configuration(
    "Ordering",
    DefinitionKey = "ordering",
    DisplayName = "Ordering")]
public sealed class OrderingOptions
{
    [OptionSetting("Backlog warning threshold")]
    public int BacklogWarningThreshold { get; set; } = 100;
}
```

Consumers continue to inject `IOptions<T>`, `IOptionsSnapshot<T>`, or `IOptionsMonitor<T>`. The immutable input plan declares one store, one section-path convention, and any ordered managed JSON sources once, then `AddConfiguration(inputPlan)` applies those same inputs to the runtime module graph.

## Point-in-time startup options

Use a startup snapshot only when a Monica-managed option must shape host topology before the runtime provider is active:

```csharp
using var bootstrap = configurationInputPlan.BuildBootstrapConfiguration(builder);

var startupOptions = await configurationInputPlan.LoadEffectiveOptionsSnapshotAsync(
    bootstrap,
    [typeof(OrderingOptions)]);

var ordering = startupOptions.Get<OrderingOptions>();
```

`LoadEffectiveOptionsSnapshot(...)` and its asynchronous counterpart make one read-only, point-in-time observation. “Read-only” describes store interaction; `Get<TOptions>()` returns an ordinary options object that startup code should treat as captured input. An existing document contributes its stored JSON; a genuinely missing document uses an in-memory seed. Loading does not publish definition metadata, create a file or database row, or promise that later runtime configuration will be identical. Runtime activation performs publication and persists any missing effective document.

Snapshot precedence is:

1. host configuration;
2. stored Monica JSON, or a transient seed when the document is missing;
3. managed JSON sources in declaration order, with later sources winning.

Reader failures, cancellation, malformed JSON, projection errors, and binding errors remain fatal. Only a missing document falls back to a seed. Values that drive topology should declare `StaticAfterStartup` or `RequiresRestart`; those declarations communicate lifecycle intent and do not add a cross-phase consistency barrier.

`AddManagedJsonFile(..., reloadOnChange)` preserves the declared watcher setting for the long-lived runtime provider. Short-lived bootstrap and startup-snapshot providers always disable file watching and should be disposed after loading.

## Schema safety limits

Configuration schemas are finite trees. Recursion through objects, nullable values, list items, or dictionary values is rejected when a non-scalar CLR type is already active on the current branch. Reusing the same type in separate sibling branches remains valid.

The root has logical depth `0`; the deepest supported logical path is `64`. Compact persisted schema JSON is bounded at depth `256`. Schema authoring failures report the logical path and CLR type chain so recursive or over-deep models can be corrected before publication.

## Stable definition identity and lifecycle

`ConfigurationAttribute.DefinitionKey` is optional. When it is omitted, Monica uses the CLR type's full name. That convention is convenient for local applications, but a namespace or type rename then creates a new configuration identity. For shared stores, long-lived history, import/export, or independently deployed services, prefer an explicit, globally unique key that remains stable across code refactors:

```csharp
[Configuration(
    "Ordering",
    DefinitionKey = "company.ordering.options",
    DisplayName = "Ordering")]
public sealed class OrderingOptions
{
}
```

Lifecycle is derived from current logical publishers rather than stored as a separate status:

- **Active** — at least one logical service currently publishes the definition, or the current process registers the matching CLR definition.
- **Retired** — the canonical definition remains available for diagnostics and audit, but no logical publisher currently reports it.

Retired definitions are excluded from normal runtime resolution, mutation, import/export, and unified-version capture. They remain visible in the Configuration UI so an operator can inspect publication history and decide whether to purge them. Publishing the same key again reactivates the definition; Monica does not infer renames by comparing schemas or display names.

Manual purge is limited to retired definitions and uses the reviewed definition revision for concurrency control. It removes the canonical definition, its publication history, and its current Monica effective-value document. Immutable value history, mutation groups, and unified-version snapshots are retained for audit. Review the preview counts before confirming the destructive action.

## File-store layout

The file store addresses definition-related documents by the canonical `ConfigurationDefinitionIdentity` rather than by the raw `DefinitionKey`:

```text
metadata/definitions/{IDENTITY}.json
effective/{IDENTITY}.json
effective/.metadata/{IDENTITY}.metadata.json
```

`{IDENTITY}` is the 64-character uppercase SHA-256 of the invariant-uppercase UTF-8 definition key. Case variants therefore resolve to the same physical documents. Definition metadata and the effective-value sidecar retain the original key and validate it against the filename; the effective JSON itself remains a separate, human-editable file.

On first store access, Monica checks the existing layout before creating directories. Stores that still contain definition-key-named files are rejected. Migrate them with a provider-aware procedure or recreate the store before upgrading; Monica does not rename, delete, or otherwise migrate legacy file-store data automatically.

## Custom store contract

`IConfigurationEffectiveValueReader` is the read-only startup boundary. It exposes `Descriptor`, `GetAsync(...)`, and ordered `GetManyAsync(...)`. Batch implementations must return one entry for every requested key in the same order. `IConfigurationEffectiveValueStore` inherits that reader and adds creation and mutation operations.

A custom `IMonicaConfigurationStoreComposition` configures the runtime store and returns an independently owned startup reader from `CreateStartupReader()`. Snapshot loading calls `GetManyAsync(...)` once, validates the result count and definition keys, and disposes the reader. The reader contract does not provide cross-process atomicity or guarantee that a later read sees the same state.

## Public choices

| API | Purpose |
|---|---|
| `MonicaConfigurationInputPlan.Create(...)` | Declares the store, section-path convention, and ordered managed JSON sources once. |
| `UseFileConfigurationStore(...)` | Selects built-in local effective-value, metadata, and history storage on the input plan. |
| `UseDbConfigurationStore(...)` | Selects the EF Core store on the input plan for shared deployments. |
| `AddManagedJsonFile(...)` | Adds a managed JSON source to the input plan; its declared watcher setting applies at runtime only. |
| `LoadEffectiveOptionsSnapshot[Async](...)` | Reads startup options without publishing metadata or persisting missing documents. |
| `UseUnifiedVersionControl()` | Enables coordinated configuration versions; at least one category, definition, predicate, or custom filter must also be registered. |
| `ConfigurationFacade` | Public management boundary for UI and Minimal API consumers. |

The EF Core store is an **Integration**, not part of this Stable package. Add `Monica.Configuration.EfCore` and call `UseDbConfigurationStore(...)` only when multiple instances need a database-backed store. `Monica.Configuration.UI` is a separate Stable operational UI.

Key defaults include short type-name section paths, fail-fast duplicate section paths, unmanaged source inventory enabled, and a 500 ms remote reload debounce.
