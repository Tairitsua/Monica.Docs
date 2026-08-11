---
title: Health Check
description: 发布稳定的存活与就绪探针，并查看当前宿主的脱敏结果。
sidebar_position: 1
---

`Monica.HealthCheck` 把 ASP.NET Core Health Check 组合为宿主统一拥有的运维契约。它映射轻量存活与就绪探针、贡献内置进程检查，并通过 `HealthCheckFacade` 暴露脱敏的时间点快照。

```bash
dotnet add package Monica.HealthCheck --prerelease
```

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddHealthCheck();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

默认端点如下：

| 探针 | 路径 | 包含的注册项 | 含义 |
|---|---|---|---|
| 就绪 | `/health` | 带 `ready` 标签的检查 | 当前实例是否应接收业务流量。 |
| 存活 | `/alive` | 带 `live` 标签的检查 | 进程是否可响应并应继续运行。 |

模块始终添加带 `live`、`ready` 和 `monica` 标签的 `monica.self`。探针端点会在所有 Web 环境中映射，并且刻意允许匿名访问，让编排平台可以在应用认证可用之前判断进程状态。运行时模块与就绪检查应独立于仅 Development 启用的 Aspire 服务或诊断页面进行注册。

探针响应刻意保持简洁：`Healthy`、`Degraded` 或 `Unhealthy`。Healthy 和 Degraded 返回 HTTP 200，Unhealthy 返回 HTTP 503。详细的有界证据通过 Facade 和可选的 [Health Check UI](../health-check-ui/index.md) 提供，不会暴露在匿名探针正文中。

## 公开使用面

- `AddHealthCheck(...)` 注册运行时、Facade、内置自检与可选端点。
- `AddMonicaLivenessCheck<THealthCheck>(...)` 添加稳定的 `live` 与 `monica` 标签。
- `AddMonicaReadinessCheck<THealthCheck>(...)` 添加稳定的 `ready` 与 `monica` 标签。
- `HealthCheckFacade.GetSnapshotAsync(...)` 执行 `All`、`Readiness` 或 `Liveness` 范围，并返回脱敏的 `Res<HealthCheckSnapshot>`。
- `HealthCheckTags` 提供稳定的 `live`、`ready` 与 `monica` 标签名。

## 接下来阅读

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [注册扩展与诊断](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [诊断与运维页面](../../scenarios/diagnostics-and-ops.md)
