---
title: Seeder UI
description: Inspect startup progress, policy origins, dependencies, attempts, and bounded failures.
sidebar_position: 1
---

`Monica.Framework.UI` adds a read-only Seeder operations page at `/seeders`. It renders the current process's [Seeder](../seeder/index.md) diagnostics and deliberately provides no rerun or manual execution controls.

The full-width page contains:

- overall readiness, run status, timing, progress, counts, and fail-fast trigger;
- effective module concurrency, execution, criticality, retry, and failure defaults;
- search plus status, criticality, and failure-policy filters;
- a dense table of status, policy, attempts, dependencies, and duration; and
- a detail drawer with policy origin, timestamps, dependency evidence, per-attempt timeline, and bounded errors.

The page polls once per second while the run is `Waiting`, `Running`, or `Aborting`, then stops in a terminal state. Manual refresh remains available. Concurrent refreshes join one request, stale snapshots remain visible after a failure, authorization is rechecked before every facade call, and page disposal cancels and drains owned work.

The dashboard is available by default in Development. Outside Development it requires explicit enablement and a valid named authorization policy.

## Next steps

- [Quick start](./quick-start.md)
- [Configuration](./configuration.md)
- [Registration and access boundary](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [Diagnostics and operations surfaces](../../scenarios/diagnostics-and-ops.md)
