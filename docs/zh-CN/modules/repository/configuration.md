---
title: Configuration
description: Repository 的公开选项、默认值与必需设置。
sidebar_position: 3
---

## Module options

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `UseDbFunction` | `bool` | `false` | 否 | 你需要使用 EF Core UDF 映射进行查询时 | 与数据库函数映射相关。 |
| `EnableSensitiveDataLogging` | `bool?` | `null` | 否 | 你要显式控制敏感数据日志时 | `null` 表示 Development 环境自动启用。 |
| `EnableEfCoreConnectionMetrics` | `bool` | `false` | 否 | 你希望通过 OpenTelemetry-compatible exporter 采集 EF Core 连接生命周期指标时 | Monica 只发出指标，不负责配置 exporter。 |
| `DisableEntitySelfConfiguration` | `bool` | `false` | 否 | 你的实体没有使用自配置接口，且你希望略过这一发现步骤时 | 关闭实体自配置发现。 |
| `DisableEntitySeparateConfiguration` | `bool` | `false` | 否 | 你不希望自动发现独立实体配置类时 | 关闭 `IEntityTypeConfiguration<TEntity>` 自动发现。 |

## Required setup

| Requirement | Satisfied by | Notes |
|---|---|---|
| 至少一个 `DbContext` 注册 | `AddRepositoryDbContext<TDbContext>(...)` | Repository 模块本身不会自动猜测你的数据库上下文；该方法同时注册 scoped 仓储访问与 `IDbContextFactory<TDbContext>`。 |
