---
title: Guide and Dependencies
description: Registration, lifetime, concurrency, and module dependencies for source analysis.
sidebar_position: 4
---

# Guide and Dependencies

## Guide method

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `AddProjectUnitCodeAnalysis()` | Registers the singleton `IProjectUnitSourceAnalyzer` and claims the ProjectUnits dependency. | Yes | Repository architecture analysis and agent tooling. |

The returned `ModuleProjectUnitCodeAnalysisGuide` has no provider-selection methods. `ModuleProjectUnitCodeAnalysisOption` currently carries no settings.

## Runtime behavior

- The analyzer serializes calls within one process because MSBuild workspace registration and large semantic loads are process-wide resources.
- Progress callbacks may run on background threads.
- The caller owns job coalescing, cache persistence, stale detection, and user-facing progress state.
- Analysis never starts selected application hosts and never executes their startup pipelines.

## Module dependency

The module claims `ModuleProjectUnitsGuide` so source classification uses the same public ProjectUnit contracts and `EProjectUnitType` vocabulary as runtime discovery.
