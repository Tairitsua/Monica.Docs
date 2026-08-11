---
title: Seeder
description: 通过已校验的依赖图执行有限、幂等的启动工作，并提供就绪证据。
sidebar_position: 1
---

`Monica.Framework` 中的 Seeder 模块会发现具体 `ISeeder` 实现，并在 `ApplicationStarted` 之后为每个宿主进程运行一次依赖图。独立 Seeder 默认并发执行；单个 Seeder 可以选择独占执行、重试、可选就绪或 FailFast 行为。

```bash
dotnet add package Monica.Framework --prerelease
```

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddSeeder();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

每次尝试都拥有新的异步 DI Scope，并以业务执行点 `seeder.run` 和自动事务模式进入 Monica Execution Pipeline。实现必须有限且幂等，因为 Retry 可能再次执行同一个操作。

模块会贡献带 `ready`、`monica` 与 `seeder` 标签的 `monica.seeder` 就绪检查。Required Seeder 在成功前始终让就绪状态保持 Unhealthy；普通失败的 Optional Seeder 报告 Degraded。任何有效 `FailFast` 故障都会中止本轮运行并让就绪状态变为 Unhealthy，即使触发者是 Optional。

诊断只保留在当前宿主进程中。`SeederFacade.GetSnapshotAsync(...)` 暴露模块配置、运行状态与时间、有效策略来源、依赖关系、每次尝试和有界错误证据。可选 [Seeder UI](../seeder-ui/index.md) 会渲染这份快照，但不会增加重新运行控制。

## 接下来阅读

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [注册、依赖图与诊断](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [诊断与运维页面](../../scenarios/diagnostics-and-ops.md)
