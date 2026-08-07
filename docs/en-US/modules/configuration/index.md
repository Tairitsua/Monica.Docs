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
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddConfiguration()
        .UseFileConfigurationStore();
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

Consumers continue to inject `IOptions<T>`, `IOptionsSnapshot<T>`, or `IOptionsMonitor<T>`. The host's configuration providers still follow normal .NET ordering: the last provider that supplies a key wins.

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

## Public choices

| API | Purpose |
|---|---|
| `UseFileConfigurationStore(...)` | Built-in local effective-value, metadata, and history storage. |
| `AddManagedJsonFile(...)` | Adds a JSON provider plus metadata that Monica can inspect and, when configured, update. |
| `UseUnifiedVersionControl()` | Enables coordinated configuration versions; at least one category, definition, predicate, or custom filter must also be registered. |
| `ConfigurationFacade` | Public management boundary for UI and Minimal API consumers. |

The EF Core store is an **Integration**, not part of this Stable package. Add `Monica.Configuration.EfCore` and call `UseDbConfigurationStore(...)` only when multiple instances need a database-backed store. `Monica.Configuration.UI` is a separate Stable operational UI.

Key defaults include short type-name section paths, fail-fast duplicate section paths, unmanaged source inventory enabled, and a 500 ms remote reload debounce.
