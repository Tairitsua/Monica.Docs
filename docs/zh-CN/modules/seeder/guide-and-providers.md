---
title: 注册、依赖图与诊断
description: 理解发现、依赖图校验、执行所有权与当前宿主 Facade。
sidebar_position: 4
---

## 公开使用面

| API | Purpose |
|---|---|
| `monica.AddSeeder(...)` | 注册发现、DAG Scheduler、就绪、状态与诊断 Facade。 |
| `ISeeder.SeedAsync(...)` | 实现一次有限、幂等的 Seed 尝试。 |
| `SeederBase` | 可选的、拥有 Logger 的 Seeder 基类。 |
| `[SeederDependsOn<TSeeder>]` | 声明一个必须成功的直接前置依赖；允许使用多个 Attribute。 |
| `[SeederPolicy]` | 覆盖执行、关键性、失败或重试策略。 |
| `SeederFacade.GetSnapshotAsync(...)` | 以 `Res<SeederDiagnosticsSnapshot>` 返回当前进程的脱敏诊断快照。 |

模块没有需要选择的存储或 Scheduler Provider。Seeder 类型会被发现并按具体类型注册为 Transient，每次尝试都从新的异步 Scope 中解析。

## 依赖图校验

以下情况会在执行前让组合失败：

- 发现的类型是 Abstract，或没有实现 `ISeeder`；
- 发现范围内类型或完整类型名重复；
- 依赖未发现、指向自身或重复声明；
- 依赖图包含环；
- Required Seeder 依赖 Optional Seeder。

只有成功的前置依赖才会释放其后续节点。Failed、Blocked 或 Cancelled 的前置依赖会阻塞整条依赖链。

## 执行所有权

每次尝试都会以 `ExecutionTransactionMode.Automatic` 进入 [Execution Pipeline](../execution-pipeline/index.md)。当 Unit of Work Behavior 参与时，尝试会获得自动事务边界。Seeder 应保持有限，避免在数据库事务内持有长时间锁或执行外部调用，并确保 Retry 安全。

可重试失败记录为 Warning；最后一次失败只记录一次 Error，并带 Seeder 类型、尝试次数和有效失败行为等结构化信息。Stack Trace 保留在日志中，诊断快照只提供有界异常类型与递归消息。

## 查询诊断

```csharp
using Monica.Framework.Seeder.Facades;
using Monica.Framework.Seeder.Models;

public sealed class StartupDiagnostics(SeederFacade seeders)
{
    public async Task<SeederDiagnosticsSnapshot?> GetAsync(
        CancellationToken cancellationToken)
    {
        var result = await seeders.GetSnapshotAsync(cancellationToken);
        return result.IsFailed(out _, out var snapshot) ? null : snapshot;
    }
}
```

快照包含配置、运行状态、UTC 时间戳、耗时、计数、确定性 FailFast 触发者、完整与友好名称、依赖、有效策略来源、尝试历史和最终有界错误。宿主进程重启后快照会被替换；持久 Seeder 历史不属于该模块范围。
