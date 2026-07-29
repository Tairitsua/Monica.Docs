---
title: DynamicProxy
description: 为明确选中的 DI 服务添加接口或类代理拦截器，并可选桥接统一执行管线。
sidebar_position: 1
---

# DynamicProxy

DynamicProxy 是 `Monica.DependencyInjection` 包内的独立可选模块。它使用 Castle 代理重写被选中的 DI 注册，让自定义 `InvocationInterceptor` 可以围绕服务方法执行。Monica 的核心类型、ProjectUnit 和原生执行 Adapter 都不依赖这个模块。

## 何时使用这个模块

- 一个普通 DI 服务没有模块原生 Adapter，但确实需要方法级拦截。
- 你需要围绕选定服务实现应用专属的审计、兼容或诊断逻辑。
- 你需要把没有原生 Adapter 的 `Task` / `Task<T>` 服务方法桥接到 ExecutionPipeline。

如果 Mediator、MVC、EventBus、Seeder、HostedService 或 JobScheduler 已经拥有明确执行边界，应优先使用它们的原生 Adapter 与 Execution Behavior，而不是再增加动态代理。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.DependencyInjection` |
| 注册入口 | `monica.AddDynamicProxy()` |
| 代理实现 | Castle DynamicProxy / AsyncInterceptor |
| 相关 UI 模块 | 无 |
| ExecutionPipeline 关系 | 独立；只有调用 `UseExecutionPipeline(...)` 时才声明依赖 |

## 公开使用面

- `ModuleDynamicProxyGuide.AddInterceptor<TInterceptor>(...)`：为谓词选中的服务注册拦截器。
- `InvocationInterceptor` 与 `IMethodInvocation`：实现方法拦截逻辑。
- `ProxyBuildContext`：在组合期读取服务类型、实现类型与 `ServiceDescriptor`。
- `SetProxyKindOfServiceType<TServiceType>(...)` 与 `EDynamicProxyKind`：选择接口代理或类代理。
- `UseExecutionPipeline(...)`：把选定异步服务方法接入统一执行管线的窄兼容桥。

## 与 ExecutionPipeline 的关系

DynamicProxy 不是统一执行管线的基础设施，也不是所有 ProjectUnit 的默认切面实现。ExecutionPipeline 由 `Monica.Core` 提供，各子系统优先直接调用它；DynamicProxy 只为没有原生 Adapter 的服务模型提供补充接入方式。

桥接后的方法使用 `DynamicProxyExecutionPoints.Method`（值为 `dynamic-proxy.method`），输入是 `DynamicProxyMethodInput`，事务模式是 `Automatic`。桥会排除已经由模块 Adapter 拥有的契约，避免重复进入管线。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [ExecutionPipeline](../execution-pipeline/index.md)
- [DependencyInjection](../dependency-injection/index.md)
