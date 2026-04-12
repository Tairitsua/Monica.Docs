---
title: UnitOfWork
description: 为仓储与 DbContext 提供统一工作单元边界，支持事务控制、SaveChanges 聚合与嵌套 UoW。
sidebar_position: 1
---

# UnitOfWork

为仓储与 DbContext 提供统一工作单元边界，支持事务控制、SaveChanges 聚合与嵌套 UoW。

## 何时使用这个模块

- 你需要把多个仓储操作放进同一个事务边界里。
- 你希望请求入口、后台任务或手工编排代码都能显式承接一个 UoW。
- 你正在把 Repository 的 `DbContextProviderType` 切到 `UnitOfWork`。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.Repository` |
| 注册入口 | `Mo.AddUnitOfWork()` |
| 相关 UI 模块 | 无 |

## 公开使用面

- `IUnitOfWork`：当前工作单元实例。
- `IUnitOfWorkManager`：创建和管理工作单元。
- `UnitOfWorkOptions`：控制事务、隔离级别与超时。
- `AddDbContextProvider<TDbContext>()`：把指定 `DbContext` 接入 UoW Provider。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
