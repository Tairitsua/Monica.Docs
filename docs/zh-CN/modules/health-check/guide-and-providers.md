---
title: 注册扩展与诊断
description: 注册标签一致的检查，并消费脱敏 Health Check 快照。
sidebar_position: 4
---

## 注册扩展

| Method | 自动添加的标签 | Typical use |
|---|---|---|
| `monica.AddHealthCheck(...)` | 添加带 `live`、`ready`、`monica` 的内置 `monica.self`。 | 统一拥有宿主探针端点与诊断 Facade。 |
| `AddMonicaLivenessCheck<T>(...)` | `live`、`monica` | 进程循环或运行时响应能力。 |
| `AddMonicaReadinessCheck<T>(...)` | `ready`、`monica` | 接收流量前必需的依赖与启动工作。 |

两个类型化扩展都支持可选失败状态、额外标签和超时。空白额外标签会被忽略，重复标签按大小写不敏感方式归一化。

Health Check 模块使用原生 `IHealthCheck` 与 `IHealthChecksBuilder` 契约，没有需要选择的 Monica 专用 Provider 抽象。现有 ASP.NET Core 检查可以与 Monica 注册项共存；只有带对应稳定标签的检查才会参与相应探针。

## 查询当前宿主

在应用或 UI 边界注入 `HealthCheckFacade`：

```csharp
using Monica.HealthCheck.Facades;
using Monica.HealthCheck.Models;

public sealed class OperationsSummary(HealthCheckFacade healthChecks)
{
    public async Task<HealthCheckSnapshot?> GetReadinessAsync(
        CancellationToken cancellationToken)
    {
        var result = await healthChecks.GetSnapshotAsync(
            HealthCheckScope.Readiness,
            cancellationToken);

        return result.IsFailed(out _, out var snapshot) ? null : snapshot;
    }
}
```

`HealthCheckScope.All` 执行全部注册项，`Readiness` 与 `Liveness` 按稳定标签筛选。快照是当前时间点、当前宿主的数据；运行时模块不会创建持久历史，也不会聚合多个实例。

需要面向运维人员的视图时，单独注册 [Health Check UI](../health-check-ui/index.md)。应独立保护 UI，不要给匿名平台探针增加认证要求。
