---
title: Guide 与运行时 API
description: 理解托管服务注册、实例身份、目录查询和检查点选择规则。
sidebar_position: 4
---

# Guide 与运行时 API

## Guide 方法

| 方法 | 启用能力 | 必需 | 典型用途 |
|---|---|---|---|
| `monica.AddHostedService(options => { ... })` | 注册运行观测、实例感知目录、检查点协调、指标和 Generic Host 生命周期集成。 | 是 | 在 Generic Host 或 Web Host 中加入可观测托管服务。 |

`ModuleHostedServiceGuide` 没有 Provider 选择方法。模块会自动组合 Observable Instance 与 Execution Pipeline 依赖。

## 实例身份

目录会保留多实例语义，不会假设每种具体类型只有一个对象：

- `IMoHostedService.ServiceKey` 是应用定义的可选区分值；多个实例可以具有相同类型，甚至相同键。
- `HostedServiceRuntimeInfo.InstanceId` 唯一标识当前宿主中的一个运行对象。
- 同一具体类型的两个不同对象会获得不同实例 ID。
- 同一对象被重复注册是无效配置。

发现阶段应使用复数查询；当后续工作必须继续定位同一对象时，应保留其 `InstanceId`。

## 目录查询

| API | 选择范围 |
|---|---|
| `GetAllServices()` | 全部已注册的 `IMoHostedService`。 |
| `GetServices<TService>()` | 具体类型精确为 `TService` 的全部实例。 |
| `GetServices(Type)` | 具体类型与给定类型精确匹配的全部实例。 |
| `GetServicesByName(name)` | 服务名称不区分大小写匹配的全部实例。 |
| `GetServicesByKey(key)` | 服务键精确匹配的全部实例；传入 `null` 可查询默认实例。 |
| `GetServiceByInstanceId(instanceId)` | 一个精确实例；不存在时返回 `null`。 |
| `GetServicesByState(state)` | 处于指定运行状态的全部实例。 |
| `GetUnhealthyServices()` | 当前不健康的全部实例。 |

类型、名称和服务键都不是唯一身份，因此相应 API 刻意采用复数返回值。

## 检查点协调

`IMoHostedServiceCheckpointCoordinator` 提供三种选择方式：

| 调用 | 选择规则 |
|---|---|
| `WaitForCheckpointAsync<TService>(checkpoint, ...)` | 要求当前仅注册一个 `TService` 实例。 |
| `WaitForCheckpointAsync<TService>(serviceKey, checkpoint, ...)` | 要求类型与键同时匹配且结果唯一。 |
| `WaitForCheckpointAsync(instanceId, checkpoint, ...)` | 选择一个精确运行实例。 |

没有匹配或存在歧义时，会抛出包含身份上下文的 `InvalidOperationException`。等待操作支持取消，可以通过 `notBeforeUtc` 要求检查点不早于指定时间；如果目标服务在发出检查点前进入故障状态，等待也会失败。

生产者必须使用自身身份发出信号：

```csharp
checkpointCoordinator.SignalCheckpoint(this, "catalog-ready");
```

传入生产者自身的 `IMoHostedService` 可防止一个实例代替另一个实例发出信号。Monica 会验证来源的 `RuntimeInfo.InstanceId` 确实属于当前目录。

## 生命周期可见性

模块会在 `IHostedLifecycleService.StartingAsync` 中解析服务、物化身份、挂接运行观察器，并发布一次目录快照。该阶段早于应用的 `IHostedService.StartAsync`。服务停止后观察器会被解除，但最终运行信息会继续保留到宿主释放。
