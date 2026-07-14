---
title: OpenTelemetry
description: Export Monica and .NET metrics through OTLP, Prometheus, console, or a local collector.
sidebar_position: 1
---

# OpenTelemetry

`Monica.OpenTelemetry` wires the OpenTelemetry metrics SDK for first-party Monica meters and common .NET instrumentation. Exporters and the bounded in-process collector are opt-in; the package does not silently choose a production backend.

```bash
dotnet add package Monica.OpenTelemetry --prerelease
```

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.ConfigureApplication(options =>
    {
        options.ProjectName = "Orders";
        options.AppVersion = "1.0.0";
    });

    monica.AddOpenTelemetry(options =>
        {
            options.DeploymentEnvironment = builder.Environment.EnvironmentName;
            options.EnableMinimalApi = true;
        })
        .UseOtlpExporter()
        .UsePrometheusEndpoint("/metrics")
        .AddMeter("Orders.*");
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

The SDK subscribes to `Monica.*` by default. ASP.NET Core, `HttpClient`, and runtime instrumentation are enabled by default. `UseOtlpExporter()` honors the OpenTelemetry SDK's `OTEL_EXPORTER_OTLP_*` environment variables when no endpoint override is supplied.

| Guide method | Purpose |
|---|---|
| `UseOtlpExporter(...)` | Sends metrics to an OpenTelemetry collector or compatible backend. |
| `UsePrometheusEndpoint(path)` | Maps a Monica-owned scraping endpoint; default `/metrics`. |
| `UseConsoleExporter()` | Local diagnostics, not durable telemetry. |
| `UseInProcessCollector(...)` | Retains bounded per-instance samples; with Minimal APIs enabled it maps `/opentelemetry/snapshot`. |
| `AddMeter(pattern)` | Adds an application or library meter pattern. |

The local collector defaults to 600 samples per series and 200 tag sets per instrument. It is for immediate inspection, not multi-instance aggregation or long-term retention. Add `Monica.OpenTelemetry.UI` separately for the Stable dashboard.
