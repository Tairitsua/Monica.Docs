---
title: Guide and Providers
description: Repository 的 Guide 方法、Provider 选择与依赖说明。
sidebar_position: 4
---

# Guide and Providers

## Guide methods

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `AddRepositoryDbContext<TDbContext>(..., DbContextProviderType)` | 注册 EF Core `DbContext`、Provider 与仓储发现 | 是（至少一次） | 所有仓储接入的起点。 |

## Provider choices

| Choice | How to enable it | When to use it |
|---|---|---|
| `DbContextProviderType.Default` | `AddRepositoryDbContext<TDbContext>(..., DbContextProviderType.Default)` | 常规 Web/API 请求里的默认选择。 |
| `DbContextProviderType.UnitOfWork` | `AddRepositoryDbContext<TDbContext>(..., DbContextProviderType.UnitOfWork)` | 你需要让仓储参与 UnitOfWork 事务边界时。 |
| `DbContextProviderType.ContextFactory` | `AddRepositoryDbContext<TDbContext>(..., DbContextProviderType.ContextFactory)` | 你更适合通过 `DbContextFactory` 创建上下文时。 |

## Module dependencies

- 模块会自动声明 ObjectMapping 依赖。
- 当你选择 `DbContextProviderType.UnitOfWork` 时，会继续拉起 UnitOfWork 相关依赖。
