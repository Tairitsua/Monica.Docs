---
title: Repository, package, and module architecture
description: Organize one repository into coherent NuGet packages, Monica modules, and optional provider-service images.
sidebar_position: 3
---

# Repository, package, and module architecture

One schema-v2 repository may release several aligned NuGet packages, and each package may contain any coherent number of Monica modules. Repository boundaries express common ownership and release policy; package boundaries express installation and dependency choices; module boundaries express independently registered runtime capabilities. Do not confuse these three identities or split a cohesive library only to force one module per package.

## Keep the two dependency graphs explicit

The repository manifest describes two complete directed acyclic graphs:

- The NuGet graph uses `packages[].packageDependencies` with full package IDs. Every edge must match a project reference during development and a NuGet dependency after packing.
- The Monica graph uses `modules[].dependsOn` with full module keys. It governs runtime composition and registration order.

Every cross-package module edge requires a corresponding package edge. The reverse is not required: a package may use another package's public types without its module depending on every module in that package. Provider modules additionally set `providerFor`, depend on that target module key, and implement `IModuleProvider`.

## Multi-package OCR example

The following is a design example and does not imply that any package or image has been published:

```text
Tairitsua.Monica.AI.OCR/
├── monica.manifest.json
├── Tairitsua.Monica.AI.OCR.slnx
├── src/
│   ├── Tairitsua.Monica.AI.OCR/
│   ├── Tairitsua.Monica.AI.OCR.PaddleOCR/
│   └── Tairitsua.Monica.AI.OCR.UI/
├── tests/
│   ├── Test.Tairitsua.Monica.AI.OCR/
│   ├── Test.Tairitsua.Monica.AI.OCR.PaddleOCR/
│   └── Test.Tairitsua.Monica.AI.OCR.UI/
├── containers/paddleocr/
└── docker-bake.hcl
```

Complete NuGet graph:

| Package | `packageDependencies` | Responsibility |
|---|---|---|
| `Tairitsua.Monica.AI.OCR` | none | Provider-neutral OCR abstractions, results, confidence, and Facade |
| `Tairitsua.Monica.AI.OCR.PaddleOCR` | `Tairitsua.Monica.AI.OCR` | HTTP connector and PaddleOCR provider module |
| `Tairitsua.Monica.AI.OCR.UI` | `Tairitsua.Monica.AI.OCR` | Optional localized OCR workbench |

Complete Monica runtime graph:

| Module key | Kind | `dependsOn` | `providerFor` |
|---|---|---|---|
| `Tairitsua.Monica.AI.OCR` | infrastructure | none | — |
| `Tairitsua.Monica.AI.OCR.PaddleOCR` | provider | `Tairitsua.Monica.AI.OCR` | `Tairitsua.Monica.AI.OCR` |
| `Tairitsua.Monica.AI.OCR.UI` | UI | `Tairitsua.Monica.AI.OCR` | — |

The provider and UI packages do not embed the contract assembly. Their packed nuspecs depend on the contract package. Every project references the selected Monica release through `PackageReference` and the configured NuGet feed only, and every resolved `Monica.*` reference equals manifest `monicaVersion`. For example, a repository targeting Monica `1.0.0-rc.6` must not introduce `MonicaSourceRoot`, sibling Monica source-project references, a different centrally managed Monica version, or a locally rebuilt package masquerading as that version.

## Multiple modules in one package

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

## Provider connector plus one OCI repository

Keep large native runtimes, models, CUDA libraries, and Python environments out of NuGet when they are operationally better isolated. Publish a small provider connector package and pair it with one OCI repository:

```text
Tairitsua.Monica.AI.OCR.PaddleOCR       .NET connector package
ghcr.io/tairitsua/monica-ai-ocr-paddleocr
  :0.1.0-alpha.1-cpu-amd64
  :0.1.0-alpha.1-nvidia-cu126-amd64
```

These references are illustrative and are not publication claims. In `monica.manifest.json`, the image entry names the connector package that owns the provider module through `companionPackageId`; both acceleration modes are targets under that one image repository. Use one multi-stage Dockerfile DAG so the variants share pinned base, dependency, application, and model layers before diverging into CPU and NVIDIA runtime stages. Both variants expose the same versioned connector-facing API and health contract.

Each runtime image must run as non-root, declare a health check, pin base/dependency/model inputs, and carry OCI version/source/revision plus Monica companion-package and accelerator labels. An NVIDIA image must fail fast when the requested GPU runtime is unavailable unless CPU fallback is explicit product behavior.

Image construction is not proof of provider behavior. Validate the normalized Bake graph, inspect the built image configuration, run a real CPU inference, then run the NVIDIA target with `docker run --gpus ...` and complete a real OCR inference on the GPU. `nvidia-smi`, a CUDA import, or a health response alone does not satisfy the GPU gate.

Declare `releaseGates.cpuSmokeCommand` and the applicable `nvidiaSmokeCommand` only after repository scripts prove this behavior. NVIDIA gates also declare one shared managed self-hosted runner label set. If any image lacks complete gates, the scaffold emits no publish workflow for the aligned release. With complete gates, local image load/inspection and all provider smoke commands finish before registry authentication or any NuGet/OCI push.

## When to split packages

Split a package when at least one boundary is real:

- Features need independent versioning or release cadence.
- Consumers should not receive a large provider SDK or static assets for an unused feature.
- License or distribution terms differ.
- A provider integration should remain optional.
- Ownership and support responsibilities differ.

Do not split solely because the package contains more than one module. Split the repository itself when version, license, source visibility, distribution, publishing target, support, or security policy no longer align across its packages and images.
