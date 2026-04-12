---
title: Quick Start
description: 安装并注册 Repository。
sidebar_position: 2
---

# Quick Start

## 安装包

```bash
dotnet add package Monica.Repository
```

## 最小注册

```csharp
using Microsoft.EntityFrameworkCore;
using Monica.DependencyInjection.Abstractions;
using Monica.Modules;
using Monica.Repository.Persistence.Services;

var builder = WebApplication.CreateBuilder(args);

Mo.AddRepository()
    .AddRepositoryDbContext<AppDbContext>((sp, options) =>
    {
        options.UseSqlite(builder.Configuration.GetConnectionString("Default")!);
    });

builder.UseMonica();

public sealed class AppDbContext(
    DbContextOptions<AppDbContext> options,
    ICachedServiceProvider serviceProvider)
    : RepositoryDbContext<AppDbContext>(options, serviceProvider)
{
}
```

## 第一个有价值的配置

对 Repository 来说，真正关键的第一步不是调 Option，而是**注册至少一个 `DbContext`**。没有 `AddRepositoryDbContext<TDbContext>(...)`，仓储层没有任何可工作的上下文来源。

## 接下来读什么

- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
