---
title: Analysis Contract
description: Understand source-analysis inputs, outputs, progress, and partial-result semantics.
sidebar_position: 3
---

# Analysis Contract

The module has no behavioral options. Each call is fully described by `ProjectUnitSourceAnalysisRequest`.

## Request rules

| Input | Rule |
|---|---|
| `WorkspaceRoot` | Must identify an existing directory. It defines relative source, project, and catalog paths. |
| `ProjectPaths` | May be absolute or workspace-relative. Paths are normalized, sorted, and deduplicated case-insensitively. |
| External project | Excluded with an `OutsideWorkspace` diagnostic. |
| Missing project | Reported as an error and makes the catalog partial. |
| Language | Only C# projects are supported. |

The caller owns solution discovery and test-project filtering. This keeps repository policy outside the semantic analyzer.

## Catalog fields

Each `ProjectUnitSourceUnit` includes:

- stable catalog and runtime keys;
- project, assembly, namespace, type, and source location;
- ProjectUnit classification using the same precedence as the runtime catalog;
- explicit metadata title, owner, description, tags, and requirement IDs;
- XML summary fallback for description;
- outgoing and incoming ProjectUnit dependencies;
- malformed-annotation and unresolved-dependency diagnostics.

Inherited custom bases are classified semantically. A concrete type derived through an application-owned base still resolves to its Monica ProjectUnit role.

## Partial results

Project load or compilation failures do not discard successful projects. The analyzer returns those units, sets `IsPartial`, and records stable diagnostics. Cancellation throws `OperationCanceledException`; the caller decides whether to retain a previous snapshot.

Empty input returns an empty catalog. It never implies 100% coverage.
