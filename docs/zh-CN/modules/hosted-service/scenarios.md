---
title: 使用场景
description: 在真实宿主中应用实例感知的托管服务观测与检查点协调。
sidebar_position: 5
---

# 使用场景

## 同一种工作器类型的多个实例

当同一个工作器实现服务于多个逻辑 Provider 或租户时，可以注册多个独立的单例 `IHostedService` 描述符。每个工厂必须返回新对象，每个对象应公开具有运维意义的 `ServiceKey`。

```csharp
builder.Services.AddSingleton<IHostedService>(services =>
    ActivatorUtilities.CreateInstance<QueueConsumer>(services, "orders"));
builder.Services.AddSingleton<IHostedService>(services =>
    ActivatorUtilities.CreateInstance<QueueConsumer>(services, "payments"));
```

在这个示例中，`QueueConsumer` 把 key 作为显式构造参数，并通过 `ServiceKey` 重写返回它；其他框架依赖由 `ActivatorUtilities` 提供。两个对象都会出现在 `GetServices<QueueConsumer>()` 中，并拥有不同的 `InstanceId`。`GetServicesByKey("orders")` 仍然是复数查询；精确后续操作应使用返回的实例 ID。

不要把同一个预创建对象注册到两个 `IHostedService` 描述符。Monica 会在任何托管服务启动前拒绝重复对象身份。

## 等待一个精确依赖项

后台消费者可以等待某个生产者实例发布命名就绪检查点。只有当宿主中该类型恰好存在一个实例时，才适合使用仅按类型等待的重载。

```csharp
// 生产者实例的目录可用之后：
checkpoints.SignalCheckpoint(this, "catalog-ready");

// 依赖方的后台操作中：
await checkpoints.WaitForCheckpointAsync<CatalogLoader>(
    "primary",
    "catalog-ready",
    cancellationToken: stoppingToken);
```

如果多个 `CatalogLoader` 实例可能共享 `"primary"` 键，请先通过 `IMoHostedServiceRegistry` 解析目标并保留其 `InstanceId`，然后调用实例 ID 重载。

不要在顺序启动期间同步阻塞，等待另一个服务稍后才会执行的 `StartAsync`。应把依赖等待放入长时间运行的后台操作；或者明确启用并理解并发启动的生命周期顺序。

## 检查停止结果

在 `host.StopAsync()` 后查询目录，可以检查最终的 `Stopped`、`Faulted` 或 `Degraded` 状态与历史：

```csharp
await host.StopAsync();

var finalSnapshots = registry.GetAllServices();
foreach (var snapshot in finalSnapshots)
{
    Console.WriteLine($"{snapshot.InstanceId}: {snapshot.CurrentState}");
}
```

这些快照会保留到宿主释放。此时运行观察器已经解除，因此停止后的状态修改不会再被视为活动生命周期观测。

## 常见错误

- 把 `IHostedService` 注册为 Scoped 或 Transient。
- 假定具体类型、显示名称或 `ServiceKey` 只会对应一个实例。
- 存在多个匹配实例时仍调用仅按类型选择的检查点重载。
- 使用任意类型或键发出检查点，而不是传入生产者自身的 `IMoHostedService` 身份。
- 期待未实现 `IMoHostedService` 的标准 `IHostedService` 出现在目录中。
