---
title: Guide and Providers
description: 接入 Repository DbContext，并理解 Execution Pipeline 依赖。
sidebar_position: 4
---

# Guide and Providers

## Guide 方法

| 方法 | 启用能力 | 典型用途 |
|---|---|---|
| `AddDbContextProvider<TDbContext>()` | 为一个 `RepositoryDbContext<TDbContext>` 注册自适应 UnitOfWork Provider。 | 手工接入已经注册的 Repository DbContext。 |

最常见的路径是 `AddRepositoryDbContext(..., DbContextProviderType.UnitOfWork)`，它会同时引入 UnitOfWork 模块并注册 Provider。

## Execution Pipeline 集成

模块会引入 `ModuleExecutionPipeline`，并在 `ExecutionBehaviorOrder.UnitOfWork` 注册 `UnitOfWorkExecutionBehavior<,>`。该行为只匹配 `ExecutionDescriptor.TransactionMode == Automatic` 的边界。

`Automatic` 表示“允许自动事务”，并不表示没有注册 UnitOfWork 时也会创建事务。作业与 Hosted Service 生命周期描述使用 `None`，因此其实现必须自己控制事务分块。

本模块不使用 MVC Filter，也不依赖 DynamicProxy。执行边界由各子系统的原生适配器建立。
