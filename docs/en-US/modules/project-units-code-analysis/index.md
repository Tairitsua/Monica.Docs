---
title: ProjectUnits Code Analysis
description: Build a serializable, source-level ProjectUnit catalog across an MSBuild workspace.
sidebar_position: 1
---

# ProjectUnits Code Analysis

`Monica.ProjectUnits.CodeAnalysis` uses MSBuild and Roslyn semantic models to discover Monica ProjectUnits across selected C# projects. It does not load consumer assemblies or start application hosts, so architecture consoles and agent tooling can inspect a repository as one workspace.

## When to use this module

- Analyze many services or modules as one architecture catalog.
- Measure source metadata and requirement annotations before a service can run.
- Resolve constructor and contract dependencies between discovered units.
- Persist or compare a stable source snapshot in a higher-level workflow product.

Use [`Monica.ProjectUnits`](../project-units/index.md) instead when the current running host is the authority and you need its operational dashboard or HTTP endpoints.

## Package and registration

| Item | Value |
|---|---|
| Package | `Monica.ProjectUnits.CodeAnalysis` |
| Registration | `monica.AddProjectUnitCodeAnalysis()` |
| Required module | `Monica.ProjectUnits` (registered as a module dependency) |
| Related UI module | None; consumers own aggregation and presentation |

## Public surface

- `IProjectUnitSourceAnalyzer` starts one cancellable semantic analysis.
- `ProjectUnitSourceAnalysisRequest` supplies the workspace root and selected project files.
- `ProjectUnitSourceAnalysisProgress` reports initialization, loading, analysis, dependency resolution, and completion.
- `ProjectUnitSourceCatalog` contains serializable units, dependencies, source locations, metadata, requirements, and diagnostics.
- `ProjectUnitSourceAnalysisContract.Version` identifies the persisted contract as `monica-project-units-source/v1`.

Catalog keys use `{project-relative-path}::{fully-qualified-type}`. `RuntimeKey` retains the CLR full name used by a running host.

## Related pages

- [Quick Start](./quick-start.md)
- [Analysis Contract](./configuration.md)
- [Guide and Dependencies](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
