---
title: Scenarios
description: Choose concurrency, exclusivity, failure behavior, and readiness semantics for startup work.
sidebar_position: 5
---

## Scenario 1 — Parallel by default

Leave independent seeders as `Concurrent`. The scheduler starts ready nodes in stable full-type-name order and allows up to `MaxConcurrency` to overlap. Dependencies still impose ordering, so parallelism emerges from the graph rather than from manual task orchestration inside a seeder.

## Scenario 2 — Run a global mutation alone

Use `[SeederPolicy(ExecutionMode = SeederExecutionMode.Exclusive)]` when a seeder must not overlap any other ready work. The scheduler drains the current concurrent wave, runs the exclusive node alone, and starts later work only after it completes.

## Scenario 3 — Preserve independent work after a failure

Use `ContinueAndRecord` for a seeder whose failure should block only its dependency chain. Independent branches continue. A failed required branch leaves readiness unhealthy; an unsuccessful optional branch reports degraded readiness.

## Scenario 4 — Abort the run but keep diagnostics alive

Use `FailFast` for a terminal failure that invalidates the rest of the startup run. After all attempts are exhausted, the scheduler:

1. records a deterministic trigger and enters `Aborting`;
2. stops scheduling new seeders;
3. cooperatively cancels and drains already-running seeders;
4. blocks the trigger's dependency chain and cancels unrelated pending nodes; and
5. enters `Aborted` while leaving the host alive and readiness unhealthy.

The policy never calls `Environment.FailFast` and never stops the host. Operators can still inspect the dashboard and logs.

## Scenario 5 — Interpret run states

`Waiting`, `Running`, and `Aborting` are active states. Terminal states are `Succeeded`, `CompletedWithFailures`, `Aborted`, and `Cancelled`. Individual seeders use `Pending`, `Running`, `Succeeded`, `Failed`, `Blocked`, or `Cancelled`; attempt history uses its own running/succeeded/failed/cancelled states.

## Common mistakes

- Writing a non-idempotent seeder and then enabling retries.
- Starting child tasks that outlive `SeedAsync`.
- Assuming `Optional` overrides an explicit `FailFast` policy.
- Making a required seeder depend on an optional one.
- Treating cooperative cancellation as proof that the host is shutting down.
- Expecting diagnostics to survive a process restart.
