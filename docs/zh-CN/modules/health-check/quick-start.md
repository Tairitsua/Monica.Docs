---
title: Quick Start
description: 注册宿主探针，并把应用检查分类为存活或就绪。
sidebar_position: 2
---

## 安装包

```bash
dotnet add package Monica.HealthCheck --prerelease
```

## 在所有环境注册运行时

```csharp
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Monica.Core.Modularity.Extensions;
using Monica.HealthCheck.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHealthChecks()
    .AddMonicaLivenessCheck<ProcessLoopHealthCheck>("orders.process-loop")
    .AddMonicaReadinessCheck<OrderDatabaseHealthCheck>(
        "orders.database",
        failureStatus: HealthStatus.Unhealthy,
        timeout: TimeSpan.FromSeconds(3));

builder.AddMonica(monica =>
{
    monica.AddHealthCheck();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();

public sealed class ProcessLoopHealthCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default) =>
        Task.FromResult(HealthCheckResult.Healthy());
}

public sealed class OrderDatabaseHealthCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default) =>
        Task.FromResult(HealthCheckResult.Healthy());
}
```

不要把 `AddHealthCheck()` 和应用就绪检查放进仅 Development 或仅启用 Aspire 时才执行的条件中。Aspire Service Defaults 可以贡献额外检查，但不能取代宿主在生产环境的就绪契约。

## 验证探针

```bash
curl -i http://localhost:5000/alive
curl -i http://localhost:5000/health
```

存活检查只应包含决定进程是否需要重启的证据。接收流量所必需的依赖——数据库连接、必需启动工作或强制外部服务——应放入就绪检查。不要把所有下游依赖都放入存活检查，否则临时依赖故障可能造成重启循环。
