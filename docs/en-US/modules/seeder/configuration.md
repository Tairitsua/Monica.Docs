---
title: Configuration
description: Configure module defaults and resolve per-seeder execution, readiness, retry, and failure policies.
sidebar_position: 3
---

## Module options

| Property | Default | Purpose |
|---|---:|---|
| `MaxConcurrency` | `Environment.ProcessorCount` | Maximum concurrent seeders; exclusive seeders still run alone. |
| `DefaultExecutionMode` | `Concurrent` | Execution mode inherited by seeders without an override. |
| `DefaultCriticality` | `Required` | Readiness criticality inherited by seeders without an override. |
| `DefaultFailureBehavior` | `ContinueAndRecord` | Terminal-failure behavior inherited by seeders without an override. |
| `DefaultMaxAttempts` | `1` | Maximum attempts inherited by a seeder; one disables retry. |
| `RetryBaseDelay` | 200 ms | Initial retry delay before exponential growth and bounded jitter. |
| `RetryMaxDelay` | 2 s | Upper bound for one retry delay. |

`MaxConcurrency` and `DefaultMaxAttempts` must be positive. Module defaults cannot use `Inherit`. `RetryBaseDelay` must be positive and `RetryMaxDelay` cannot be smaller than it.

## Per-seeder policy

`[SeederPolicy]` resolves each property independently:

| Property | Inherit value | Explicit choices |
|---|---:|---|
| `ExecutionMode` | `Inherit` | `Concurrent`, `Exclusive` |
| `Criticality` | `Inherit` | `Required`, `Optional` |
| `FailureBehavior` | `Inherit` | `ContinueAndRecord`, `FailFast` |
| `MaxAttempts` | `0` | Positive attempt count; `1` disables retry. |

The diagnostics snapshot reports each effective value and whether it came from `ModuleDefault` or `SeederOverride`.

## Policy meanings

- `Concurrent` allows overlap with other ready concurrent seeders up to `MaxConcurrency`.
- `Exclusive` closes the current concurrent wave, waits for running work to drain, then runs alone.
- `Required` contributes unhealthy readiness until success.
- An unsuccessful `Optional` seeder normally contributes degraded readiness.
- `ContinueAndRecord` records the terminal failure, blocks its dependency chain, and continues independent work.
- `FailFast` activates only after retries are exhausted, stops new scheduling, cancels and drains in-flight work, and leaves the host alive but unready.

Failure behavior and criticality are intentionally independent. An optional seeder explicitly configured as `FailFast` still aborts the run and makes readiness unhealthy.

Retry delays grow exponentially from `RetryBaseDelay`, use bounded jitter, and never exceed `RetryMaxDelay`. Every attempt receives a new asynchronous scope so failed transactions and scoped services do not leak into the retry.
