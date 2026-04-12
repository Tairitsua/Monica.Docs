---
title: Configuration
description: Repository 的公开选项、默认值与必需设置。
sidebar_position: 3
---

# Configuration

## Module options

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `UseDbFunction` | `bool` | `false` | 否 | 你需要使用 EF Core UDF 映射进行查询时 | 与数据库函数映射相关。 |
| `UseDbContextFactory` | `bool` | `false` | 否 | 你希望额外注册 `DbContextFactory` 时 | 对后台任务或特殊创建模式有帮助。 |
| `EnableSensitiveDataLogging` | `bool?` | `null` | 否 | 你要显式控制敏感数据日志时 | `null` 表示 Development 环境自动启用。 |
| `DisableEntitySelfConfiguration` | `bool` | `false` | 否 | 你的实体没有使用自配置接口，且你希望略过这一发现步骤时 | 关闭实体自配置发现。 |
| `DisableEntitySeparateConfiguration` | `bool` | `false` | 否 | 你不希望自动发现独立实体配置类时 | 关闭 `IEntityTypeConfiguration<TEntity>` 自动发现。 |

## Required setup

| Requirement | Satisfied by | Notes |
|---|---|---|
| 至少一个 `DbContext` 注册 | `AddRepositoryDbContext<TDbContext>(...)` | Repository 模块本身不会自动猜测你的数据库上下文。 |
