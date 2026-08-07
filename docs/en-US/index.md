---
title: Architecture agents can follow
description: Build observable .NET backends with an architecture that coding agents and human teams can follow together.
sidebar_position: 1
---

Monica is an agent-governed application architecture for observable .NET backends. It turns infrastructure registration, DDD application roles, and runtime inspection into one explicit contract.

Use Monica when you want coding agents to move quickly without inventing a different architecture in every feature—and when operators need to understand the system that actually started.

## Start here

- [Getting started](getting-started/index.md) — install the Stable packages and run a host.
- [Host-bound composition](concepts/host-bound-composition.md) — understand the module graph and lifecycle.
- [ProjectUnits](concepts/project-units.md) — give application code explicit architectural roles.
- [Execution boundaries](concepts/execution-boundaries.md) — understand where shared behaviors run and why each subsystem owns its boundary explicitly.
- [Testing Monica applications](guides/testing-monica-applications.md) — choose between complete host scenarios, raw ProjectUnit fixtures, and UI tests.
- [Stable module catalog](modules/index.md) — choose the supported capabilities your host actually needs.
- [Package maturity](packages/index.md) — choose between Stable, Integrations, and Labs.
- [Third-party ecosystem](ecosystem/index.md) — build, brand, license, and publish an independent Monica module package.
- [Runtime observability](guides/runtime-observability.md) — inspect modules, jobs, configuration, and telemetry.

## The core idea

```text
agent guidance -> typed ProjectUnits -> validated module graph -> inspectable runtime
```

The same vocabulary appears in source code, agent skills, module diagnostics, and operational UI. That continuity is the product: the architecture does not disappear after startup.

## Runnable references

- `examples/Monica.ReferenceApplication` is a domain-first Ordering application with ProjectUnits, generated HTTP endpoints, and OpenTelemetry.
- `examples/JobSchedulerMinimal` is the smallest host that exposes the JobScheduler dashboard.
- `Monica.Templates` provides the `dotnet new monica-api` starting point.
