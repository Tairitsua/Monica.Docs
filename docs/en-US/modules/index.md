---
title: Module catalog
description: Choose Stable Monica capabilities and explicitly identified Labs modules.
sidebar_position: 1
---

# Module catalog

The pages in this section cover Monica's user-facing module surface. Stable means a capability belongs to the supported Monica 1.0 application path; selected Labs capabilities are listed separately and remain explicitly fast-moving. Neither maturity level means every application should install every package.

Independent packages may bundle several coherent modules in one NuGet package. Each module still has its own registration contract and package-scoped key. See [Multi-module package architecture](../ecosystem/multi-module-package-architecture.md).

## Compose an application

| Capability | Start here | Package |
|---|---|---|
| Host boundary and module graph | [Core composition](./core-composition/index.md) | `Monica.Core` |
| Observable Generic Host services and readiness checkpoints | [Hosted Service](./hosted-service/index.md) | `Monica.Core` |
| Typed execution behaviors and runtime catalog | [Execution Pipeline](./execution-pipeline/index.md) | `Monica.Core` |
| Schema-first application settings | [Configuration](./configuration/index.md) | `Monica.Configuration` |
| Conventional service registration | [Dependency Injection](./dependency-injection/index.md) | `Monica.DependencyInjection` |
| Local and distributed events | [EventBus](./event-bus/index.md) | `Monica.EventBus` |
| HTTP APIs and generated controllers | [WebApi and AutoControllers](./web-api/index.md) | `Monica.WebApi` |
| Request-owned endpoints and RPC clients | [AutoControllers](./auto-controllers/index.md) | `Monica.WebApi` + `Monica.Generators.AutoController` |
| EF Core persistence | [Repository](./repository/index.md) | `Monica.Repository` |
| Transaction boundaries and completion hooks | [Unit of Work](./unit-of-work/index.md) | `Monica.Repository` |
| Recurring and triggered work | [JobScheduler](./job-scheduler/index.md) | `Monica.JobScheduler` |
| Architectural role discovery | [ProjectUnits](./project-units/index.md) | `Monica.ProjectUnits` |

## Operate and extend it

| Capability | Start here | Package |
|---|---|---|
| Metrics and exporters | [OpenTelemetry](./open-telemetry/index.md) | `Monica.OpenTelemetry` |
| Host-local structured logging | [Logging](./logging/index.md) | `Monica.Logging` |
| In-memory and distributed state contracts | [StateStore](./state-store/index.md) | `Monica.StateStore` |
| Markdown catalogs and search | [Markdown](./markdown/index.md) | `Monica.Markdown` |
| Blazor operational shell | [UI](./ui/index.md) | `Monica.UI` |
| Execution-plan catalog page | [Execution Pipeline](./execution-pipeline/index.md) | `Monica.Framework.UI` |
| Instance registration and leader election | [Service Discovery](./service-discovery/index.md) | `Monica.ServiceDiscovery` |
| Authentication and permission bits | [Authority](./authority/index.md) | `Monica.Authority` |
| Model metadata and dynamic expressions | [AutoModel](./auto-model/index.md) | `Monica.AutoModel` |

## Labs capabilities

| Capability | Start here | Package |
|---|---|---|
| Host-local execution duration diagnostics | [Execution Timing](./execution-timing/index.md) | `Monica.Profiling` |

## Maturity rule

- **Stable** packages may depend only on Stable packages.
- **Integrations** are versioned adapters such as EF Core configuration storage, Kafka, Redis/StackExchange, Dapr, and SignalR.
- **Labs** are deliberately fast-moving and may change before promotion.

See [Package maturity](../packages/index.md) before adding a provider or Labs capability.
