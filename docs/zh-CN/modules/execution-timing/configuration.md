---
title: Configuration
description: 配置 Execution Timing 的聚合方式、刷新周期与 Web 端点。
sidebar_position: 3
---

## Module options

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `AggregationMode` | `ExecutionTimingAggregationMode` | `BackgroundBatch` | 否 | 已完成统计必须在调用线程同步更新时使用 `Inline`。 | 后台模式降低热路径写入工作，并组合 HostedService 模块。 |
| `BackgroundFlushInterval` | `TimeSpan` | `250 ms` | 否 | 为高频样本调整延迟与开销平衡。 | 只用于 `BackgroundBatch`；非正值会回退为 `250 ms`。 |
| `EnableMinimalApi` | `bool?` | `null` | 否 | 设为 `true` 或 `false`，覆盖当前模块的宿主级端点策略。 | `null` 时跟随 `EnableMinimalApiByDefault`，其框架默认值为 `false`；对 Generic Host 无效。 |
| `ApiGroup` | `string?` | `null` | 否 | 在 Web Host 中覆盖端点 Tag/Group 名称。 | 回退到模块系统默认 Group，再回退到 `ModuleExecutionTiming`。 |

`EnableMinimalApi` 是 Execution Timing 唯一的端点开关，不存在单独的 Execution Timing 端点选项。

## Aggregation modes

| Mode | 完成路径 | 查询行为 | 推荐用途 |
|---|---|---|---|
| `BackgroundBatch` | 已完成样本进入队列，由 Hosted Coordinator 定期写入聚合统计。 | 统计查询会先排空待处理样本。 | 高频生产测量的默认选择。 |
| `Inline` | 在调用线程同步写入已完成样本。 | 无需队列刷新即可立即看到统计。 | 需要确定性即时可见性，或不希望启用批处理服务的宿主。 |

两种模式都会立即注册活动 Invocation，完成后将其移除，并公开相同的 `IExecutionTimingFactory` 与 `IExecutionTimingQuery` 契约。

## 直接配置选项

```csharp
using Microsoft.Extensions.Hosting;
using Monica.Core.Modularity.Extensions;
using Monica.Modules;
using Monica.Profiling.ExecutionTiming.Models;

var builder = Host.CreateApplicationBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddExecutionTiming(options =>
    {
        options.AggregationMode = ExecutionTimingAggregationMode.BackgroundBatch;
        options.BackgroundFlushInterval = TimeSpan.FromMilliseconds(500);
    });
});

using var host = builder.Build();
await host.RunAsync();
```

选择标准聚合模式时优先使用 Guide 方法；如果一段配置代码需要同时设置多个模块属性，也可以直接赋值 Option。

## 端点行为

ASP.NET Core Host 启用 Minimal API 后，`MapMonica()` 会映射：

| Method | Route | Result |
|---|---|---|
| `GET` | `/execution-timing/statistics` | 按平均耗时、显示名称和操作键排序的已完成统计。 |
| `GET` | `/execution-timing/running` | 按当前耗时、显示名称和 Invocation ID 排序的活动 Invocation。 |

Generic Host 保留采集、聚合和查询能力，但永远不会映射这些端点。设置 `EnableMinimalApi = true` 不会把 Generic Host 变成 Web Host。

## Recorder settings

每个 `IExecutionTimingRecorder` 提供两个可选的 Recorder 级属性：

| Property | Default | Behavior |
|---|---|---|
| `EnableLogging` | `false` | 样本完成时记录 Information 日志。 |
| `Description` | `null` | 为运行中操作诊断与日志增加显示上下文。 |

`EnableMemoryTracking` 已过时，因为异步延续切换后线程本地分配量会失真。不要把它作为生产内存指标。
