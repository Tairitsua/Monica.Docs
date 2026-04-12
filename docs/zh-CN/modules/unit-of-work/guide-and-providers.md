---
title: Guide and Providers
description: UnitOfWork 的 Guide 方法、Provider 选择与依赖说明。
sidebar_position: 4
---

# Guide and Providers

## Guide methods

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `AddDbContextProvider<TDbContext>()` | 为指定 `DbContext` 注册 UnitOfWork Provider | 否，但真实使用通常需要 | 手工把某个 `DbContext` 接到当前 UoW。 |

## Provider choices

| Choice | How to enable it | When to use it |
|---|---|---|
| Repository 集成模式 | `AddRepositoryDbContext(..., DbContextProviderType.UnitOfWork)` | 最常见，也最容易与仓储一起使用。 |
| 手工挂接模式 | `AddDbContextProvider<TDbContext>()` | 你已经有 Repository 或其他上下文注册方式，只想补上 UoW Provider 时。 |

## Module dependencies

- 最常与 Repository 模块一起出现。
- 模块会自动把 MVC `UnitOfWorkActionFilter` 加入 `MvcOptions`。
