---
title: Guide and Providers
description: Repository 的 Guide 方法、Provider 选择与依赖说明。
sidebar_position: 4
---

# Guide and Providers

## Guide methods

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `AddRepositoryDbContext<TDbContext>(..., DbContextProviderType)` | 注册 EF Core `DbContext`、仓储 Provider、仓储发现与 `IDbContextFactory<TDbContext>` | 是（至少一次） | 所有仓储接入的起点。 |

## Provider choices

| Choice | How to enable it | When to use it |
|---|---|---|
| `DbContextProviderType.Default` | `AddRepositoryDbContext<TDbContext>(..., DbContextProviderType.Default)` | 常规 Web/API 请求里的默认选择。 |
| `DbContextProviderType.UnitOfWork` | `AddRepositoryDbContext<TDbContext>(..., DbContextProviderType.UnitOfWork)` | 你需要让仓储参与 UnitOfWork 事务边界时。 |

`DbContextProviderType` 只决定 scoped 仓储如何取得当前上下文。无论选择 `Default` 还是 `UnitOfWork`，`AddRepositoryDbContext<TDbContext>(...)` 都会注册一个 host-owned `IDbContextFactory<TDbContext>`。工厂创建的每个上下文都拥有独立 DI scope，调用方必须处置上下文来释放该 scope。

不要再额外调用 `AddDbContextFactory<TDbContext>()` 覆盖同一个上下文的工厂；数据库 Provider 与相关选项统一写在 `AddRepositoryDbContext(...)` 回调中。

## Module dependencies

- 模块会自动声明 ObjectMapping 依赖。
- 当你选择 `DbContextProviderType.UnitOfWork` 时，会继续拉起 UnitOfWork 相关依赖。
