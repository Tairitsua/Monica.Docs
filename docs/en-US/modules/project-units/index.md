---
title: ProjectUnits
description: Discover a host-scoped architecture catalog and expose typed status, detail, and requirement-traceability views.
sidebar_position: 1
---

`Monica.ProjectUnits` discovers supported application roles, connects their dependencies, records architecture diagnostics, and exposes serializable projections for agents, APIs, and management UI.

## Public entry points

| Surface | Purpose |
|---|---|
| `monica.AddProjectUnits()` | Registers discovery, catalog services, facade, and HTTP endpoints. |
| `ModuleProjectUnitsOption` | Configures naming checks, XML detail parsing, and request filtering. |
| `UseRequirementLinkResolver<TResolver>()` | Maps stable requirement IDs to optional detail links. |
| `ProjectUnitsFacade` | Returns typed list, dashboard, detail, event, and enum results. |
| `monica.AddProjectUnitsUI()` | Adds the `/project-units` operational page. |

## Typed HTTP queries

| Method and route | Result |
|---|---|
| `GET /framework/units/dashboard` | Current-host identity, type distribution, independent coverage, topology, alerts, and actionable gaps. |
| `GET /framework/units` | `ProjectUnitSummary` for every discovered unit. |
| `GET /framework/units/{key}` | `ProjectUnitDetail`, including lazily resolved requirement references. |

`key` is the unit's full CLR type name and should be URL-encoded by clients. Responses use Monica `Res` envelopes. Raw `Type`, `MethodInfo`, attributes, and internal `ProjectUnit` objects do not cross this boundary.

## Status dashboard

The first `/project-units` tab shows:

- service identity and version from `IMonicaApplicationOptions`;
- total units, distinct types, metadata coverage, requirement coverage, and alerts;
- responsive type distribution and independent context-coverage gauges;
- dependency edges, isolated units, and diagnostic severity;
- coverage-gap rows that open typed unit detail;
- resolved and unresolved requirement references.

The catalog is startup-stable, so refresh is manual. The page always represents the current host; it is not a cross-service control plane.

## Next steps

- [Quick start](./quick-start.md)
- [Configuration](./configuration.md)
- [Registration and Resolver](./guide-and-providers.md)
- [Adoption scenarios](./scenarios.md)
- [ProjectUnits as an architecture contract](../../concepts/project-units.md)
