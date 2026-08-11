---
title: Configuration
description: Configure probe paths and understand endpoint and snapshot safety guarantees.
sidebar_position: 3
---

## Module options

| Property | Default | Purpose |
|---|---:|---|
| `EnableReadinessEndpoint` | `true` | Maps the readiness probe when enabled. |
| `ReadinessPath` | `/health` | Absolute application path for checks tagged `ready`. |
| `EnableLivenessEndpoint` | `true` | Maps the liveness probe when enabled. |
| `LivenessPath` | `/alive` | Absolute application path for checks tagged `live`. |

Enabled paths must start with `/`, cannot be `/`, and cannot contain a query or fragment. Readiness and liveness paths must be distinct when both endpoints are enabled. Invalid configuration fails module composition instead of producing an ambiguous runtime route.

```csharp
builder.AddMonica(monica =>
{
    monica.AddHealthCheck(options =>
    {
        options.ReadinessPath = "/ops/ready";
        options.LivenessPath = "/ops/live";
    });
});
```

## Probe response contract

Both endpoints disable response caching and return plain text. The status mapping is fixed:

| Aggregate state | HTTP status |
|---|---:|
| `Healthy` | 200 |
| `Degraded` | 200 |
| `Unhealthy` | 503 |

The endpoints are anonymous by design. Keep them minimal and control network reachability at the ingress, service mesh, or platform layer.

## Snapshot sanitization

`HealthCheckFacade` is intended for authenticated operational consumers. Each snapshot includes aggregate status, UTC check time, total duration, counts, and entries ordered by registration name. Entry descriptions, diagnostic values, and exception messages are bounded to 2 KiB; at most 32 data entries are retained. Values whose keys contain credential-like fragments such as `password`, `secret`, `token`, `credential`, or `connectionstring` are replaced with `[redacted]`.

Exception snapshots contain only the exception type and bounded message. Assembly details, exception objects, and stack traces remain outside the facade response.
