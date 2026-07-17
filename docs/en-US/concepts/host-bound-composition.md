---
title: Host-bound composition
description: Understand how Monica records, validates, and applies one module graph per host.
sidebar_position: 1
---

# Host-bound composition

`builder.AddMonica(monica => ...)` owns one Monica application context. Every option, guide, dependency edge, runtime catalog, and diagnostic snapshot created during that callback belongs to the same host.

## Lifecycle

1. Your callback records requested modules and guide configuration.
2. Modules declare their dependencies into the same graph.
3. Monica validates required guide choices and rejects dependency cycles.
4. The graph is ordered deterministically.
5. Options are finalized and services are registered by phase.
6. Web middleware and endpoints are applied later through `UseMonica()` and `MapMonica()`.

The graph is sealed when the callback returns. A retained guide cannot mutate it afterward.

## Why the boundary matters

- Two hosts in one test process do not overwrite each other's module options.
- Invalid graphs fail before an application begins serving traffic.
- Module diagnostics describe the host you are inspecting, not a process-global approximation.
- Coding agents have one obvious place to discover application capabilities.

## Public module shape

Every module follows the same shape:

| Part | Responsibility |
|---|---|
| `monica.Add{Name}()` | Adds the module to the current host graph. |
| `Module{Name}Option` | Configures host-owned behavior and defaults. |
| `Module{Name}Guide` | Selects providers or optional capabilities. |
| `Module{Name}` | Declares dependencies and applies lifecycle phases. |

Provider choices remain explicit. For example, JobScheduler does not silently choose a persistence provider; the guide makes the decision visible in the composition root.

## Test the same boundary

`MonicaTestApplicationFactory<TDiscoveryAnchor>` creates a complete, independently owned Monica host for each application scenario. Use it when a test must prove module composition, type discovery, options, interception, persistence, or lifecycle behavior.

[Read the testing guide](../guides/testing-monica-applications.md).
