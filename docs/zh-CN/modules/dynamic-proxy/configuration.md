---
title: Configuration
description: DynamicProxy 的模块选项、代理类型默认值与服务约束。
sidebar_position: 3
---

# Configuration

## Module options

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `ConfiguredProxyKinds` | `Dictionary<Type, EDynamicProxyKind>` | 空 | 否 | 特定服务类型需要覆盖默认代理类型时 | 优先通过 `SetProxyKindOfServiceType<TServiceType>(...)` 修改。 |
| `EnableClassProxyTargetStateWarning` | `bool` | `false` | 否 | 排查 Factory / Instance 注册上的有状态类代理时 | 只增加诊断告警，不改变代理行为。 |

## Default proxy selection

Monica 根据 DI 暴露的服务类型选择默认代理：

| Exposed service type | Default | Requirements |
|---|---|---|
| 接口 | `EDynamicProxyKind.InterfaceProxy` | 实现类型必须实现该接口；代理包装目标对象。 |
| 具体类型 | `EDynamicProxyKind.ClassProxy` | 实现类不能是 `sealed`；只有虚成员可以被拦截。 |

可以使用 Guide 显式覆盖：

```csharp
monica.AddDynamicProxy()
    .SetProxyKindOfServiceType<IOrderService>(
        EDynamicProxyKind.InterfaceProxy);
```

`InterfaceProxy` 要求 `TServiceType` 本身是接口。`ClassProxy` 仍要求每个匹配实现可继承，并且需要拦截的方法保持 `virtual`、`abstract` 或虚 `override` 语义。

## Class proxy target state warning

Factory 或 Instance 注册使用 class-proxy-with-target 时，代理对象与目标对象可能各自持有字段状态。对于真正有可变实例状态的服务，这可能造成状态分离。

```csharp
monica.AddDynamicProxy(options =>
{
    options.EnableClassProxyTargetStateWarning = true;
});
```

该开关默认关闭，因为 Monica 的常见无状态服务也可能由 Factory 注册，普遍开启会产生噪声。它适合诊断具体的有状态类代理，不是通用正确性开关。

## Interceptor selection

`AddInterceptor<TInterceptor>(...)` 的谓词接收 `ProxyBuildContext`：

- `ServiceType`：DI 对外暴露的服务类型。
- `ImplementationType`：解析出的具体实现类型。
- `ServiceDescriptor`：原始注册描述，可读取 Lifetime、Key 与激活方式。

谓词在宿主组合服务注册时求值，不是每次方法调用时求值。请根据稳定的注册元数据筛选，不要期待读取请求级状态。

## ExecutionPipeline bridge constraints

`UseExecutionPipeline(...)` 额外遵循以下限制：

- 只桥接 `Task` 与 `Task<T>` 方法。
- 同步方法和 `ValueTask` 方法直接执行目标，不进入管线。
- 拒绝 Singleton 服务，因为桥必须从当前调用的 DI Scope 解析 `IExecutionPipeline`。
- 自动排除执行管线基础设施、拦截器、Behavior 和实现 `IExecutionAdapterOwnedComponent` 的原生 Adapter 契约。
- 方法参数中存在 `CancellationToken` 时，会把它传给执行管线；否则使用默认令牌。
