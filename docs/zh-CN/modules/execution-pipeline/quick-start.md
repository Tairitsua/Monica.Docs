---
title: Quick Start
description: 注册第一个类型化 Behavior，并检查已经观察到的运行时执行计划。
sidebar_position: 2
---

## 安装包

```bash
dotnet add package Monica.Core --prerelease
dotnet add package Monica.Framework.UI --prerelease
```

`Monica.Framework.UI` 是可选包；只有需要内置运行时目录页面时才安装。

## 定义一个 Behavior

下面的开放泛型 Behavior 会记录所有被选中业务边界的执行时间。它必须把异常和取消原样传递，并且最多调用一次 `next()`。

```csharp
using System.Diagnostics;
using Microsoft.Extensions.Logging;
using Monica.Core.Execution;

public sealed class OperationTimingBehavior<TInput, TResult>(
    ILogger<OperationTimingBehavior<TInput, TResult>> logger)
    : IExecutionBehavior<TInput, TResult>
{
    public async Task<TResult> ExecuteAsync(
        ExecutionContext<TInput> context,
        ExecutionDelegate<TResult> next)
    {
        var stopwatch = Stopwatch.StartNew();

        try
        {
            return await next();
        }
        finally
        {
            logger.LogInformation(
                "Operation {OperationName} completed in {ElapsedMilliseconds} ms",
                context.Descriptor.DisplayName,
                stopwatch.ElapsedMilliseconds);
        }
    }
}
```

## 注册 Behavior

开放泛型 Behavior 使用 `AddBehavior(Type, ...)`。过滤器只读取不可变的 `ExecutionDescriptor`，因此执行计划可以安全缓存。

```csharp
using Monica.Core.Execution;
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddExecutionPipeline()
        .AddBehavior(
            typeof(OperationTimingBehavior<,>),
            ExecutionBehaviorOrder.Diagnostics + 200,
            static descriptor => descriptor.IsBusinessOperation);
    monica.AddExecutionPipelineUI();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

对于只实现一个确定 `IExecutionBehavior<TInput, TResult>` 契约的闭合 Behavior，也可以使用 `AddBehavior<TBehavior>(...)`。

## 打开运行时目录

启动应用后打开：

```text
/execution-pipeline
```

页面始终展示当前宿主的 Behavior 注册项。执行计划列表最初可能为空：只有描述符实际执行过，或应用代码显式调用 `IExecutionPipelineCatalog.InspectPlan(descriptor)` 后，准确计划才会出现。点击“刷新”读取最新内存快照；页面不会轮询，也不会代替用户触发业务操作。

## 接下来读什么

- [Configuration](./configuration.md) 说明描述符、事务模式与过滤规则。
- [Guide and Providers](./guide-and-providers.md) 列出原生 Adapter、排序契约和目录 API。
- [Scenarios](./scenarios.md) 展示按执行点筛选和自定义边界。
