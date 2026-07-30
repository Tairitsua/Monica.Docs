---
title: Guide and Providers
description: ExecutionPipeline 的 Guide、运行时目录 API、准确顺序与内置 Adapter。
sidebar_position: 4
---

# Guide and Providers

## Guide methods

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `AddBehavior(Type, int, Func<ExecutionDescriptor, bool>?, ServiceLifetime)` | 注册闭合 Behavior 或双泛型参数的开放 Behavior | 否 | 同一个实现需要覆盖多种输入和结果类型时使用 `Type` 重载。 |
| `AddBehavior<TBehavior>(int, Func<ExecutionDescriptor, bool>?, ServiceLifetime)` | 注册闭合 Behavior 类型 | 否 | Behavior 只实现一个确定契约时。 |

较小的 `order` 会包裹较大的 `order`。标准顺序带如下：

| Constant | Value | 预期职责 |
|---|---:|---|
| `ExecutionBehaviorOrder.Diagnostics` | `-3000` | 追踪、指标与诊断。 |
| `ExecutionBehaviorOrder.Authorization` | `-2000` | 认证与授权。 |
| `ExecutionBehaviorOrder.Routing` | `-1000` | 路由、远程执行或本地短路。 |
| `ExecutionBehaviorOrder.UnitOfWork` | `0` | 事务与 UnitOfWork。 |
| `ExecutionBehaviorOrder.Application` | `1000` | 应用自定义扩展。 |

## Catalog APIs

| API | 行为 | 副作用 |
|---|---|---|
| `IExecutionPipelineCatalog.GetSnapshot()` | 返回全部注册项，以及所有已观察或显式检查的计划。 | 无；不会解析 Behavior，也不会执行过滤器。 |
| `IExecutionPipelineCatalog.InspectPlan(descriptor)` | 物化一个可复用描述符的准确计划，并返回 Ready 或 Faulted 快照。 | 首次计算注册过滤器和泛型兼容性，然后缓存结果。 |
| `ExecutionPipelineCatalogFacade.GetSnapshotAsync()` | 为 UI 和其他宿主入口返回 `Res<ExecutionPipelineCatalogSnapshot>`。 | 除创建当前时间点的结果信封外无副作用。 |

注册快照保留配置的 `Order` 与 `ServiceLifetime`、开放泛型和过滤器标记，以及可空的 `SourceModuleKey`。存在模块键表示 Behavior 由该模块贡献；`null` 表示宿主直接注册。计划中的应用项还同时展示原始注册类型与闭合后的解析类型，因此无需解析实例也能看清开放泛型如何应用。

目录与真实执行使用同一个排序契约：较小顺序位于外层，相同顺序按实现类型身份确定性排序。应用链用一位起始位置展示这个准确顺序。

## Runtime catalog UI

从 `Monica.Framework.UI` 注册可选目录页面：

```csharp
builder.AddMonica(monica =>
{
    monica.AddExecutionPipelineUI();
});
```

页面启用时，`AddExecutionPipelineUI()` 依赖 ExecutionPipeline、Localization 和 Shell UI。它在 Infrastructure 导航分类下注册 `/execution-pipeline`，展示注册项与已观察计划摘要、基于稳定描述符/目录元数据的筛选，以及按准确顺序排列的计划详情。页面通过 `ExecutionPipelineCatalogFacade` 读取数据，只在用户请求时刷新。

组合式 UI 包需要排除此页面时，可将 `ModuleExecutionPipelineUIOption.DisablePage` 设为 `true`。禁用后的 UI 模块不会注册页面状态或 UI 依赖，也不会改变独立注册的 Core 执行管线。

## Native adapters

原生 Adapter 由拥有执行入口的模块提供。每个 Adapter 只建立一次对应边界。

| Adapter | Execution point | Transaction mode |
|---|---|---|
| Mediator request handler | `MediatorExecutionPoints.Request` | `Automatic` |
| Direct MVC action | `MvcExecutionPoints.Action` | `Automatic` |
| Local EventBus handler | `EventBusExecutionPoints.LocalHandler` | `Automatic` |
| Distributed EventBus handler | `EventBusExecutionPoints.DistributedHandler` | `Automatic` |
| Seeder | `SeederExecutionPoints.Run` | `Automatic` |
| Hosted work item | `HostedServiceExecutionPoints.WorkItem` | `Automatic` |
| Hosted service start / stop | `HostedServiceExecutionPoints.Start` / `Stop` | `None` |
| Recurring / triggered job attempt | `JobSchedulerExecutionPoints.RecurringAttempt` / `TriggeredAttempt` | `None` |

生成式 Mediator Controller 会带有 `[MediatedController]`，因此 MVC Adapter 会跳过它们。手写 Controller 如果调用 `IMediator`，必须显式添加 `[MediatedController]`；仅调用 Mediator 不会被自动识别，否则同一次请求会形成嵌套的 MVC 与 Mediator 边界。

## Built-in behavior integrations

以下模块会在启用自身能力时向 ExecutionPipeline 注册 Behavior：

| Module | Behavior role | Selection |
|---|---|---|
| Authorization | 授权 | `IsBusinessOperation` |
| ChainTracing | 调用链追踪 | `IsBusinessOperation` |
| ExecutionTiming | 执行耗时诊断 | `IsBusinessOperation` |
| UnitOfWork | 自动 UoW | `TransactionMode == Automatic` |

这些模块会声明对 ExecutionPipeline 的依赖。只有添加自定义 Behavior 或开发新 Adapter 时，应用才通常需要直接调用 `AddExecutionPipeline()`。

## Provider choices

ExecutionPipeline 没有可替换 Provider；它是 `Monica.Core` 内的共享内核。普通服务方法运行在调用方已经建立的执行边界内。如果某个子系统确实拥有新的独立入口，应由该子系统提供明确描述输入、目标、取消、结果、特性与事务策略的类型化 Adapter，不应以容器级方法拦截替代边界所有权。
