---
title: Runtime observability
description: Connect the declared architecture to Monica's operational surfaces and OpenTelemetry signals.
sidebar_position: 1
---

# Runtime observability

Monica keeps the declared architecture visible after startup. Runtime surfaces can show the module graph, ProjectUnits, dependency injection, configuration sources, jobs, repositories, and telemetry owned by the current host.

## Start with OpenTelemetry

```csharp
builder.AddMonica(monica =>
{
    monica.AddOpenTelemetry()
        .UsePrometheusEndpoint();
});
```

The reference application exposes `/metrics` and a small `/healthz` endpoint. Operational UI modules can then add focused human-readable views without replacing OpenTelemetry as the machine-facing signal path.

## Keep diagnostic surfaces intentional

- Add only the UI modules an operator needs.
- Keep public read-only APIs separate from writable demo/admin hosts.
- Protect operational routes with the application's authentication and network policy.
- Avoid high-cardinality metric tags such as raw user IDs, URLs, or exception messages.
- Treat module and ProjectUnit catalogs as host-owned snapshots.

The goal is not a dashboard for every class. The goal is a traceable line from declared capability to runtime evidence.
