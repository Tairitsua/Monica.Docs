---
title: 配置
description: 配置托管服务的历史记录、心跳和启动失败行为。
sidebar_position: 3
---

## 模块选项

向 `monica.AddHostedService(...)` 传入选项回调：

```csharp
builder.AddMonica(monica =>
{
    monica.AddHostedService(options =>
    {
        options.DefaultMaxHistorySize = 200;
        options.DefaultHeartbeatInterval = TimeSpan.FromSeconds(30);
        options.FailFastOnStartupError = true;
    });
});
```

| 属性 | 类型 | 默认值 | 必需 | 何时修改 | 说明 |
|---|---|---|---|---|---|
| `DefaultMaxHistorySize` | `int` | `100` | 否 | 默认保留更多或更少的状态变更。 | 服务可以重写 `MaxHistorySize`。 |
| `DefaultHeartbeatInterval` | `TimeSpan` | `1 分钟` | 否 | 调整 `MoBackgroundService` 的心跳频率。 | 服务可以重写 `HeartbeatInterval`；返回 `null` 可禁用。 |
| `FailFastOnStartupError` | `bool` | `false` | 否 | 让 Monica 托管服务基类的启动错误终止宿主启动。 | 为 `false` 时，基类记录并输出错误，但不重新抛出。 |

`MoHostedService` 不使用心跳监测。`MoBackgroundService` 会使用 `DefaultHeartbeatInterval`，除非具体服务自行重写。

## 注册校验

宿主启动时，Monica 会在任何生命周期参与者执行前校验全部 `IHostedService` 描述符；即使启用了 `HostOptions.ServicesStartConcurrently`，此规则也不变。

- 接受单例描述符。
- 拒绝 Scoped 或 Transient `IHostedService` 描述符。
- 接受同一具体类型的多个不同对象。
- 拒绝同一对象被重复注册。

普通场景请使用 `builder.Services.AddHostedService<TService>()`。如果通过工厂注册多个实例，每个 `IHostedService` 描述符仍须为单例，并且每个工厂必须返回不同对象。

## 单个服务的覆盖项

`IMoHostedService` 负责自己的公开身份和观测设置：

| 成员 | 作用 |
|---|---|
| `ServiceName` | 便于识别的运行时名称。 |
| `ServiceKey` | 可选实例区分值，语义类似带键 DI 身份。 |
| `ServiceGroupId` | 关联服务的可选分组值。 |
| `MaxHistorySize` | 当前实例的状态历史上限。 |
| `HeartbeatInterval` | 心跳间隔；不适用或禁用时为 `null`。 |

建议使用 `"orders"`、`"payments"` 这类稳定且有运维意义的 `ServiceKey`。当操作必须命中一个精确运行实例时，应使用 `HostedServiceRuntimeInfo.InstanceId`，而不是服务键。
