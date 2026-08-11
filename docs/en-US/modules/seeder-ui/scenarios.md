---
title: Scenarios
description: Read Seeder progress and failure evidence without mutating the one-run lifecycle.
sidebar_position: 5
---

## Scenario 1 — Watch startup progress

Open `/seeders` while the host starts. The overview combines readiness and run state; the table shows which nodes are pending, running, or complete. Polling stops automatically when the run reaches a terminal state.

## Scenario 2 — Explain why a seeder did not run

Filter for `Blocked` or `Cancelled`, open the detail drawer, and inspect direct dependencies plus the final diagnostic. A blocked node records unsuccessful dependency evidence. During fail-fast, unrelated pending nodes are cancelled instead.

## Scenario 3 — Audit effective policy

The drawer shows execution mode, criticality, failure behavior, and maximum attempts together with `ModuleDefault` or `SeederOverride`. This distinguishes a host default from a deliberate annotation on one seeder.

## Scenario 4 — Investigate retries

The attempt timeline records one-based attempt number, state, start and completion times, duration, and bounded error details. Use logs for full stack traces and structured terminal-failure metadata.

## Scenario 5 — Respond to an aborted run

An `Aborting` or `Aborted` run is unhealthy regardless of the trigger's criticality. The page remains available because fail-fast aborts only Seeder execution, not the host. Inspect the trigger, cancelled in-flight work, blocked dependency chain, and logs before restarting or deploying a fix.

## Common mistakes

- Looking for a rerun button; the page is intentionally read-only.
- Treating `CompletedWithFailures` as one fixed readiness state; required and optional outcomes differ.
- Assuming a stale snapshot is current after a refresh warning.
- Expecting attempts from a previous process to remain available.
