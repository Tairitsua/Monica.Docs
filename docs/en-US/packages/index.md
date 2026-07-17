---
title: Package maturity
description: Understand the Stable, Integrations, and Labs compatibility promises.
sidebar_position: 1
---

# Package maturity

Maturity labels describe compatibility expectations and adoption risk. They do not mean that every application should install every Stable package.

| Tier | Promise | Representative capabilities |
|---|---|---|
| **Stable** | The supported Monica 1.0 application path. | Core, ProjectUnits, WebApi, Configuration, Repository, JobScheduler, OpenTelemetry, Testing, UI |
| **Integrations** | Versioned adapters around external provider boundaries. | EF Core, Kafka, Redis/StackExchange, Dapr, SignalR |
| **Labs** | Fast-moving capabilities that may change before promotion. | AI/RAG/MCP, DataChannel, DevOps and profiling, Office, Experimental |

Stable does not depend on Labs. Integration packages are optional and should appear in the composition root only when the deployment actually uses that provider.

## Adoption rule

Start with the smallest Stable graph that expresses the application. Add an Integration when infrastructure requires it. Adopt Labs deliberately, with the expectation that its public surface can move faster than the 1.0 kernel.

The framework repository keeps the canonical maturity manifest and validates every publishable project against it. The website mirrors that reviewed manifest for the launch catalog.
