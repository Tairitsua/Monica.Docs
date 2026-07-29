---
title: Scenarios
description: 按业务边界选择 Execution Behavior、检查实际应用链，并为自定义子系统建立明确 Adapter。
sidebar_position: 5
---

# Scenarios

## 场景 1 — 只观察业务操作

授权、调用链和性能指标通常只关心业务工作。用稳定描述符筛选即可：

```csharp
monica.AddExecutionPipeline()
    .AddBehavior(
        typeof(OperationTimingBehavior<,>),
        ExecutionBehaviorOrder.Diagnostics + 200,
        static descriptor => descriptor.IsBusinessOperation);
```

不要在这个谓词里读取当前请求、用户或租户；谓词的结果会进入可复用执行计划。

## 场景 2 — 只处理某个执行点

公开的执行点常量适合精确限制 Behavior 范围：

```csharp
using Monica.EventBus;

monica.AddExecutionPipeline()
    .AddBehavior(
        typeof(DistributedDeliveryBehavior<,>),
        ExecutionBehaviorOrder.Application,
        static descriptor =>
            descriptor.Point == EventBusExecutionPoints.DistributedHandler);
```

`ExecutionPoint` 的值区分大小写。优先使用拥有模块提供的常量，不要在每次调用时创建新的执行点。

## 场景 3 — Job 内使用有限事务

Recurring 和 Triggered Job 进入执行管线，但其 `TransactionMode` 是 `None`。这能避免长扫描或批量任务被一个作业级事务包裹。需要持久化时，在 Job 内按业务批次显式调用 `IUnitOfWorkManager.RunAsync(...)`：

```csharp
await unitOfWorkManager.RunAsync(
    async () =>
    {
        await repository.SaveBatchAsync(batch, cancellationToken);
    },
    cancellationToken: cancellationToken);
```

批次大小与提交边界属于业务语义，不应由通用 Job Adapter 猜测。

## 场景 4 — 为新子系统提供 Adapter

模块作者应在真实调度点构造一次稳定描述符，然后通过当前 DI Scope 的 `IExecutionPipeline` 执行终态。对于接口入口，使用 `ExecutionDescriptor.ForInterface<TInput, TResult>(...)`；对于明确方法入口，使用 `ForMethod<TInput, TResult>(...)`。没有结果的 `Func<Task>` 终态必须使用 `ExecutionUnit` 作为描述符结果类型，例如 `ForMethod<TInput, ExecutionUnit>(...)`；无结果管线重载会校验这一点。

描述符工厂会记忆化等价边界。传入的元数据必须稳定，不能包含请求值。新 Adapter 还应明确选择 `Automatic` 或 `None`，而不是把事务策略隐含在命名约定中。

## 场景 5 — 解释某个操作使用的 Behavior 链

注册 `monica.AddExecutionPipelineUI()`，实际触发目标操作后打开 `/execution-pipeline`。选择对应的已观察计划，可以检查：

- 稳定操作、组件、契约、方法、输入/结果、业务操作和事务元数据；
- 从最外层到最内层的准确应用链；
- 每个 Behavior 的配置顺序、生命周期、来源模块、注册类型和闭合解析类型；
- 计划 Faulted 时缓存的物化错误。

如果应用已经拥有一个可复用描述符，但操作尚未执行，可以显式物化计划，而且不会解析 Behavior 实例：

```csharp
var plan = executionPipelineCatalog.InspectPlan(descriptor);
```

只对应用已经拥有的描述符调用 `InspectPlan(...)`。`GetSnapshot()` 和 UI 不会为了让目录看起来完整而猜测描述符或执行过滤器。

## Common mistakes

- 把 DynamicProxy 当成 ExecutionPipeline 的必需依赖。
- 为已有原生 Adapter 的契约再开启代理桥，造成重复执行。
- 让 `descriptorFilter` 依赖调用级状态。
- 在两个相同顺序的 Behavior 之间建立先后依赖。
- 在 `AddBehavior(...)` 之外再次注册同一个 Behavior 实现类型。
- 在一个 Behavior 中多次或并发调用 `next()`；管线会拒绝重复继续。
- 认为 `ExecutionTransactionMode.Automatic` 在未注册 UnitOfWork Behavior 时也会自动开启事务。
- 期待从未执行或显式检查过的操作自动出现在计划列表中。
- 当业务操作或事务策略不同时，仍然只按 `OperationKey` 聚合计划。
