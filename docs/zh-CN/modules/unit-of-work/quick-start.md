---
title: Quick Start
description: 接入 UnitOfWork DbContext 并执行显式事务工作。
sidebar_position: 2
---

## 安装包

```bash
dotnet add package Monica.Repository --prerelease
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
```

## 注册参与工作单元的 DbContext

```csharp
using Microsoft.EntityFrameworkCore;
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddRepository()
        .AddRepositoryDbContext<OrderingDbContext>(
            (_, db) => db.UseSqlite("Data Source=ordering.db"),
            DbContextProviderType.UnitOfWork);
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

`DbContextProviderType.UnitOfWork` 会引入 UnitOfWork 模块，并把该 DbContext 接到当前 ambient scope。

## 执行一次显式事务

```csharp
using Monica.Repository.UnitOfWork.Abstractions;

public sealed class OrderImporter(
    IUnitOfWorkManager unitOfWorkManager,
    IOrderRepository repository)
{
    public Task ImportAsync(Order order, CancellationToken cancellationToken)
    {
        return unitOfWorkManager.RunAsync(
            () => repository.InsertAsync(order, cancellationToken),
            cancellationToken: cancellationToken);
    }
}
```

普通的单事务操作优先使用 `RunAsync(...)`。只有代码需要手工 flush 或提交后回调时，才使用 `BeginScope(...)`。
