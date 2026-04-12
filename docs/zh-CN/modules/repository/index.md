---
title: Repository
description: 提供基于 EF Core 的仓储抽象、DbContext Provider 注册、实体仓储自动发现与 GUID 生成能力。
sidebar_position: 1
---

# Repository

提供基于 EF Core 的仓储抽象、DbContext Provider 注册、实体仓储自动发现与 GUID 生成能力。

## 何时使用这个模块

- 你希望用 Monica 的统一仓储抽象封装 EF Core 访问。
- 你想把 `DbContext` 注册、仓储发现与 Provider 选择放在模块层完成。
- 你需要和 UnitOfWork 组合出一致的事务边界。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.Repository` |
| 注册入口 | `Mo.AddRepository()` |
| 相关 UI 模块 | 无 |

## 公开使用面

- `IRepository<TEntity>`、`IRepository<TEntity, TKey>`：仓储公开抽象。
- `IDbContextProvider<TDbContext>`：向仓储提供当前 `DbContext`。
- `RepositoryDbContext<TDbContext>`：Monica 风格的 EF Core `DbContext` 基类。
- `IGuidGenerator`：GUID 生成抽象。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
