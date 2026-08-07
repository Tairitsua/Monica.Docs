---
title: Configuration
description: Configure Hosted Service history, heartbeat, and startup failure behavior.
sidebar_position: 3
---

## Module options

Pass an options callback to `monica.AddHostedService(...)`:

```csharp
builder.AddMonica(monica =>
{
    monica.AddHostedService(options =>
    {
        options.DefaultMaxHistorySize = 200;
        options.DefaultHeartbeatInterval = TimeSpan.FromSeconds(30);
        options.FailFastOnStartupError = true;
    });
});
```

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `DefaultMaxHistorySize` | `int` | `100` | No | Retain more or fewer state transitions by default. | A service can override `MaxHistorySize`. |
| `DefaultHeartbeatInterval` | `TimeSpan` | `1 minute` | No | Tune heartbeat cadence for `MoBackgroundService` implementations. | A service can override `HeartbeatInterval`; return `null` to disable it. |
| `FailFastOnStartupError` | `bool` | `false` | No | Make startup failures from Monica hosted-service base classes stop host startup. | When `false`, the base class records and logs startup failure without rethrowing it. |

`MoHostedService` does not use heartbeat monitoring. `MoBackgroundService` uses `DefaultHeartbeatInterval` unless the concrete service overrides it.

## Registration validation

At host startup, Monica validates every `IHostedService` descriptor before lifecycle participants run, including when `HostOptions.ServicesStartConcurrently` is enabled.

- Singleton descriptors are accepted.
- Scoped or transient `IHostedService` descriptors are rejected.
- Multiple distinct objects of one concrete type are accepted.
- The same object registered more than once is rejected.

Use `builder.Services.AddHostedService<TService>()` for the common case. If a factory registers multiple instances, each `IHostedService` descriptor must still be singleton and each factory must return a distinct object.

## Per-service overrides

An `IMoHostedService` controls its own public identity and observation settings:

| Member | Purpose |
|---|---|
| `ServiceName` | Human-readable runtime name. |
| `ServiceKey` | Optional instance discriminator, analogous to a keyed DI identity. |
| `ServiceGroupId` | Optional grouping value for related services. |
| `MaxHistorySize` | State-history limit for this instance. |
| `HeartbeatInterval` | Heartbeat cadence, or `null` when not applicable or disabled. |

Prefer stable, operationally meaningful `ServiceKey` values such as `"orders"` or `"payments"`. Use `HostedServiceRuntimeInfo.InstanceId`, not the key, when an operation must target one exact runtime instance.
