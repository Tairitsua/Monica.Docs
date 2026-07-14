---
title: Logging
description: Configure structured logging without process-global logger state.
sidebar_position: 1
---

# Logging

`Monica.Logging` configures a Serilog logger owned by the current host, replaces the host's logging providers, and routes Monica registration logs through that same logger. Each host owns and disposes its logger independently.

```bash
dotnet add package Monica.Logging --prerelease
```

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddLogging(options =>
    {
        options.EnableConsoleSink = true;
        options.EnableFileSink = false;
        options.EnableTraceIdEnricher = true;
    });
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

Console and file sinks are enabled by default. Thread IDs are enriched by default; thread names and trace IDs are not. Set `LogFilePath` to control the full path, or use `LogDirectory` plus `LogFileName`. `CustomLoggerFactory` can replace the default Monica Serilog pipeline.

`AddRequestResponseLoggingMiddleware(disableResponse, disableRequest)` is optional. Request and response bodies can contain credentials, personal data, or large payloads, so enable payload logging only with an explicit redaction and retention policy.

## Consume logging

Application code should use host-owned Microsoft logging:

- Inject `ILogger<T>` into ordinary DI services.
- Use the protected `Logger` property inside Monica `ServiceBase`-derived types, including `ApplicationService`, `CustomApplicationService`, `DomainService`, `DomainEventHandler`, and `LocalEventHandler`. These types receive their logger after DI activation, so do not access it from a derived constructor.
- Pass an `ILogger` into manually constructed helpers when they need diagnostics.

There is no process-global `LogManager` or current logger factory. Do not assign `Serilog.Log.Logger`, cache a host logger in static mutable state, or build a temporary service provider to obtain logging.
