---
title: Guide and Providers
description: ExecutionPipeline 的 Guide 方法、顺序带与内置 Adapter。
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

## Native adapters

原生 Adapter 由拥有执行入口的模块提供。应用无需为这些边界开启 DynamicProxy。

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

被模块原生 Adapter 拥有的契约实现 `IExecutionAdapterOwnedComponent`。可选 DynamicProxy 桥会排除这些契约，避免一次业务调用进入管线两次。

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

ExecutionPipeline 没有可替换 Provider；它是 `Monica.Core` 内的共享内核。对于没有原生 Adapter 的普通服务，可以选择独立的 [DynamicProxy](../dynamic-proxy/index.md) 兼容桥，但不要把它当作所有入口的默认接入方式。
