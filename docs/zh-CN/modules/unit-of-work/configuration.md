---
title: Configuration
description: UnitOfWork 的公开选项、默认值与必需设置。
sidebar_position: 3
---

# Configuration

## Module options

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `EnableEntityEvent` | `bool` | `false` | 否 | 你希望在 UoW 中启用实体变化事件时 | 打开后会注册异步本地事件发布/存储能力。 |

## Required setup

| Requirement | Satisfied by | Notes |
|---|---|---|
| 让某个 `DbContext` 进入 UoW 生命周期 | `AddDbContextProvider<TDbContext>()` 或 `AddRepositoryDbContext(..., DbContextProviderType.UnitOfWork)` | 否则仓储不会从当前工作单元解析到对应上下文。 |
