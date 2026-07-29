---
title: Scenarios
description: Apply source-level ProjectUnit analysis to workspace catalogs and agent-readiness workflows.
sidebar_position: 5
---

# Scenarios

## Multi-service workspace catalog

Discover root solution manifests in the consuming application, merge and deduplicate their in-workspace C# projects, apply repository-specific exclusions, then submit the final project list once. Store `ProjectUnitSourceAnalysisContract.Version` beside the result so a contract change invalidates the cache.

## Agent-readiness coverage

Use explicit metadata, descriptions, owners, and requirement IDs as independent dimensions. Requirement existence is a consumer concern: resolve IDs against the workspace knowledge system after semantic analysis. A source annotation alone should not prove traceability when its target cannot be found.

## Safe refresh

Fingerprint the selected project set, Git state, relevant source content, and external traceability inputs. Save only a successful or partial catalog. A failed or cancelled refresh should leave the previous persisted snapshot intact.

## Common mistakes

- Sending test or external projects without applying repository policy first.
- Treating `IsPartial` as complete coverage.
- Using `RuntimeKey` as a cross-project workspace key instead of `CatalogKey`.
- Assuming an annotated requirement ID is resolved without checking the owning knowledge store.
