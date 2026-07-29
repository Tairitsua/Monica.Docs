---
title: Multi-module package architecture
description: Organize one NuGet package around any coherent number of infrastructure, provider, web, and UI modules.
sidebar_position: 3
---

# Multi-module package architecture

One NuGet package may contain any coherent number of Monica modules. Package boundaries express versioning and distribution; module boundaries express independently registered capabilities. Do not split a cohesive library only to force one module per package.

## Example package

This package ships analytics, alerts, and a lightweight UI together:

```text
src/Acme.Monica.Analytics/
├── Modules/
│   ├── ModuleAnalytics.cs
│   ├── ModuleAlerts.cs
│   └── ModuleAnalyticsUI.cs
├── Analytics/
│   ├── Abstractions/
│   ├── Models/
│   ├── Facades/
│   ├── Services/
│   └── Providers/
├── Alerts/
│   ├── Abstractions/
│   ├── Models/
│   ├── Facades/
│   └── Services/
├── Pages/
├── UIAnalytics/
│   ├── Components/
│   ├── State/
│   └── Support/
├── Localization/
├── wwwroot/
└── Acme.Monica.Analytics.csproj
```

The package declares independent identities:

| Module | Module key | Registration |
|---|---|---|
| Analytics | `Acme.Monica.Analytics` | `monica.AddAnalytics()` |
| Alerts | `Acme.Monica.Analytics.Alerts` | `monica.AddAlerts()` |
| Analytics UI | `Acme.Monica.Analytics.UI` | `monica.AddAnalyticsUI()` |

Consumers install one package and register only the modules their host needs.

## Feature-first organization

Start with simple project-level layers for a small package. When real sub-domains emerge, add root feature folders such as `Analytics/` and `Alerts/`, with the usual layers inside each feature. Keep module registration artifacts in `Modules/`; they contain registration, options, Guide methods, and dependency declarations, not business logic.

Use only the layers a feature needs:

- `Abstractions/`, `Models/`, `Events/`, and intentional `Extensions/` form the cross-module public contract.
- `Facades/` expose host and UI use cases through `Res` or `Res<T>`.
- `Services/` orchestrate implementation with normal .NET return values and exceptions.
- `Providers/` isolate external systems and vendor SDKs.
- `Annotations/` contains developer-facing attributes.
- `Metrics/` contains telemetry contracts and implementation.
- `Utils/` contains pure internal utilities.

Features must not call another feature's internal services. Depend on its public abstractions and models, or declare a Monica module dependency when registration order and availability matter.

## One contract per module

Even when several modules share an assembly, each module still needs:

- A unique package-scoped `ModuleKey`
- Its own `Module{Name}`, `Module{Name}Option`, and `Module{Name}Guide`
- Its own `monica.Add{Name}()` entry point
- Package-owned registration types under `<PackageId>.Modules`
- Explicit dependencies declared through the module graph
- Focused host-composition tests
- A README table explaining registration, side effects, and dependencies

Do not create one catch-all module that silently enables unrelated capabilities.

## Mixed UI packages

A mixed package may contain infrastructure and UI modules in the same Razor SDK project when the UI is lightweight and shares the same release lifecycle. Keep the boundary explicit:

- The infrastructure module owns abstractions, models, services, providers, and Facades.
- UI components inject public Facades; they do not reach into `Services/` or `Providers/`.
- The UI module gets its own key ending in `.UI` and its own `Add{Name}UI()` registration.
- UI routes live at or below the package-family path without `<Publisher>.Monica.`, such as `/analytics`; Monica rejects duplicate routes in the shared host namespace.
- Each UI module derives a stable navigation category ID from its own module key minus the final `.UI`. Multiple UI modules in one package therefore contribute distinct categories without splitting the NuGet distribution.
- Each page uses `RegisterLocalizedPage<TPage, TResource>()`; package categories use `RegisterLocalizedCategory<TResource>()`. Title and category-label keys stay in the owning resource and that resource is registered through `AddResource<TResource>()`.
- A UI module normally derives from `ModuleBase`. Use `WebModuleBase` only when it actually configures middleware or endpoints.
- Keep route pages thin; move reusable presentation, state, and formatting into `UI{Name}/Components`, `State`, and `Support`.
- Keep localization resources in the project-level `Localization/` folder and static assets under `wwwroot/`.

Use a separate `<Publisher>.Monica.<Package>.UI` package when the UI needs independent versioning, introduces substantial dependencies for non-UI consumers, or should be distributed separately.

## When to split packages

Split a package when at least one boundary is real:

- Features need independent versioning or release cadence.
- Consumers should not receive a large provider SDK or static assets for an unused feature.
- License or distribution terms differ.
- A provider integration should remain optional.
- Ownership and support responsibilities differ.

Do not split solely because the package contains more than one module.
