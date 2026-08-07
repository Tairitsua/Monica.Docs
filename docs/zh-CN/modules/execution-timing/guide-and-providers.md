---
title: 注册扩展与运行时 API
description: 选择聚合模式，并使用 Execution Timing 的公开记录与查询契约。
sidebar_position: 4
---

Execution Timing 没有可替换 Provider。注册扩展用于在两个内置聚合 Coordinator 之间选择，应用则通过宿主中立的 Factory 与 Query 抽象交互。

## 注册扩展

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `UseInlineAggregation()` | 在调用线程同步聚合每个已完成样本。 | 否 | 测试、低频测量或需要确定性即时聚合的场景。 |
| `UseBackgroundBatchAggregation(TimeSpan? flushInterval = null)` | 将已完成样本入队，并由 Monica 后台服务聚合。 | 否 | 高频计时样本的生产工作负载。 |

默认使用后台批处理和 Option 中的 `250 ms` 刷新周期。

```csharp
builder.AddMonica(monica =>
{
    monica.AddExecutionTiming()
        .UseBackgroundBatchAggregation(TimeSpan.FromSeconds(1));
});
```

## Factory API

| Method | 立即启动 | 释放时停止 | 身份行为 |
|---|---:|---:|---|
| `CreateRecorder(name, description?)` | 否 | 否 | 同时使用 `name` 作为操作键和显示名称；支持重复 `Start()` / `Stop()` 样本。 |
| `BeginScope(name, description?)` | 是 | 是 | 同时使用 `name` 作为操作键和显示名称；用于单个可释放作用域。 |
| `BeginInvocation(operationKey, displayName, invocationId, description?)` | 是 | 是 | 保留稳定聚合键和调用方提供的非空 Invocation ID。 |

操作键、名称和显示名称不能为空，也不能包含首尾空白。`BeginInvocation(...)` 还会拒绝 `Guid.Empty`。

`CreateRecorder(...)` 返回可复用 Recorder，但释放时不会自动停止活动样本，必须先调用 `Stop()`。`BeginScope(...)` 与 `BeginInvocation(...)` 返回自动启动的 Scope，并在释放时记录样本。

## Query API

| Method | Result |
|---|---|
| `GetStatistics()` | 以操作键为 Key 的全部已完成聚合快照字典。 |
| `GetStatistics(operationKey)` | 一个已完成聚合；该 Key 尚无完成样本时返回 `null`。 |
| `GetRunningOperations()` | 以 Invocation ID 为 Key 的全部活动操作快照字典。 |
| `Reset(operationKey)` | 移除一个操作键的已完成统计。 |

`Reset(...)` 不会取消活动操作。相同 Key 后续完成时会创建新的聚合。

## 自动 Execution Pipeline Behavior

模块依赖 Execution Pipeline，并以 `ExecutionBehaviorOrder.Diagnostics + 100` 注册 `ExecutionTimingBehavior<,>`。该 Behavior 只选择 `IsBusinessOperation == true` 的描述符，使用描述符的操作键和显示名称启动 Invocation 计时，并在最终操作成功、失败或取消时始终释放 Scope。

## Module dependencies

| Dependency | When composed | Why |
|---|---|---|
| Execution Pipeline | 始终 | 测量 Monica 原生业务操作边界。 |
| HostedService | `AggregationMode == BackgroundBatch` | 通过 Generic Host 生命周期运行后台队列排空 Coordinator。 |

模块可以从 Web module 降级，因此这些依赖和全部公开记录/查询 API 都可用于 `Host.CreateApplicationBuilder(...)`。ASP.NET Core 之外会跳过端点映射。

## 相关 UI 模块

`monica.AddExecutionTimingUI()` 注册内置 `/execution-timing` 页面；页面启用时还会组合 Execution Timing、Localization 与 Shell UI。UI 模块是可选项，基础设施模块和公开 Query API 不依赖它。
