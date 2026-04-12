---
title: Quick Start
description: 安装并注册 UnitOfWork。
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
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

Mo.AddUnitOfWork();

Mo.AddRepository()
    .AddRepositoryDbContext<AppDbContext>(
        (sp, options) =>
        {
            options.UseSqlite(builder.Configuration.GetConnectionString("Default")!);
        },
        DbContextProviderType.UnitOfWork);

builder.UseMonica();
```

## 第一个有价值的配置

如果你希望仓储真正参与 UoW，不要只注册模块本身，还要让对应 `DbContext` 使用 `UnitOfWork` Provider，或显式调用 `AddDbContextProvider<TDbContext>()`。

```csharp
public sealed class OrderService(IUnitOfWorkManager unitOfWorkManager)
{
    public async Task ExecuteAsync()
    {
        using var uow = unitOfWorkManager.Begin(new UnitOfWorkOptions(isTransactional: true));

        // 调用仓储与领域服务...

        await uow.CompleteAsync();
    }
}
```

## 接下来读什么

- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
