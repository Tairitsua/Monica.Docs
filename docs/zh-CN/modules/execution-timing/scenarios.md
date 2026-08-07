---
title: Scenarios
description: 将 Execution Timing 用于 Worker、可复用操作、Pipeline 边界与 Web 诊断。
sidebar_position: 5
---

## 场景 1 — 在 Worker 中测量工作

在 Generic Host 中注册 Execution Timing，并把 `IExecutionTimingFactory` 注入 Worker。一个 `using` 块表示完整操作时，使用 `BeginScope(...)`：

```csharp
using Microsoft.Extensions.Hosting;
using Monica.Profiling.ExecutionTiming.Abstractions;

public sealed class ImportWorker(IExecutionTimingFactory timingFactory)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using (timingFactory.BeginScope("imports.orders", "Import orders"))
            {
                await ImportOrdersAsync(stoppingToken);
            }
        }
    }

    private static Task ImportOrdersAsync(CancellationToken cancellationToken)
        => Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);
}
```

Generic Host 不会公开 Execution Timing HTTP 路由。应用代码可以查询 `IExecutionTimingQuery`，也可以通过应用自己拥有的接口导出快照。

## 场景 2 — 用一个 Recorder 记录重复样本

当应用组件拥有一个稳定操作并明确控制每次样本时，使用 `CreateRecorder(...)`：

```csharp
using Monica.Profiling.ExecutionTiming.Abstractions;

public sealed class BatchProcessor : IDisposable
{
    private readonly IExecutionTimingRecorder _recorder;

    public BatchProcessor(IExecutionTimingFactory timingFactory)
    {
        _recorder = timingFactory.CreateRecorder(
            "batches.process",
            "Process one queued batch");
    }

    public async Task ProcessAsync(CancellationToken cancellationToken)
    {
        _recorder.Start();
        try
        {
            await Task.Delay(20, cancellationToken);
        }
        finally
        {
            _recorder.Stop();
        }
    }

    public void Dispose() => _recorder.Dispose();
}
```

使用 `finally`，让失败或取消的尝试也能完成计时样本。不要并发调用同一个可变 Recorder。

## 场景 3 — 自动测量 Monica 业务操作

`AddExecutionTiming()` 会注册 Execution Behavior，应用无需再手工包裹 Mediator、EventBus、Job、Seeder、Hosted Work 或直接 MVC 操作。边界是否为业务操作由拥有它的 Adapter 决定，Execution Timing 只使用这份稳定元数据。

需要确认某个已观察计划是否应用 `ExecutionTimingBehavior<,>`，以及它在准确 Behavior 链中的位置时，使用 [Execution Pipeline 运行时目录](../execution-pipeline/index.md)。

## 场景 4 — 有意公开 Web 诊断

只在确实应该访问宿主本地诊断的 Web Host 上启用两个只读路由：

```csharp
builder.AddMonica(monica =>
{
    monica.AddExecutionTiming(options => options.EnableMinimalApi = true)
        .UseBackgroundBatchAggregation(TimeSpan.FromMilliseconds(500));
});
```

模块提供路由 Payload，但不会代替应用的授权、网络绑定或运维访问策略。除非应用有意保护并公开，否则应保持诊断接口私有。

## Common mistakes

- 期待 `EnableMinimalApi = true` 在 Generic Host 中映射路由。
- 在 Web Host 中忘记依次调用 `app.UseMonica()` 和 `app.MapMonica()`。
- 使用不稳定或包含业务值的操作键，导致聚合统计碎片化。
- 在高频热路径选择内联聚合，却没有接受调用线程更新成本。
- 释放 `CreateRecorder(...)` 返回的 Recorder 前没有先调用 `Stop()`。
- 让并发操作共享一个可复用 Recorder；应改用独立 `BeginScope(...)` 或显式 Invocation ID。
- 为异步工作启用已过时的线程本地内存跟踪。
