---
title: DependencyInjection
description: 提供 Monica 的约定式依赖注入、服务暴露规则与自动注册诊断快照。
sidebar_position: 1
---

# DependencyInjection

提供 Monica 的约定式依赖注入、服务暴露规则与自动注册诊断快照。

## 何时使用这个模块

- 你希望通过标记接口或注解自动注册服务，而不是为每个实现手写 DI 配置。
- 你需要显式控制服务暴露到哪些接口或 keyed service。
- 你想查看自动注册结果与生命周期推断是否符合预期。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.DependencyInjection` |
| 注册入口 | `Mo.AddDependencyInjection()` |
| 相关 UI 模块 | `Mo.AddDependencyInjectionUI()` |

## 公开使用面

- `ITransientDependency`、`IScopedDependency`、`ISingletonDependency`：声明服务生命周期。
- `DependencyAttribute`、`ExposeServicesAttribute`、`ExposeKeyedServiceAttribute`：显式控制注册行为。
- `ICachedServiceProvider`：Monica 中常见的缓存服务提供者抽象。
- `DependencyInjectionDiagnosticsFacade`：读取自动注册诊断快照。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
