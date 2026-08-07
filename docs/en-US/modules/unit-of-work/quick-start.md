---
title: Quick start
description: Add a Unit-of-Work-backed DbContext and run explicit transactional work.
sidebar_position: 2
---

## Install

```bash
dotnet add package Monica.Repository --prerelease
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
```

## Register a participating DbContext

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

`DbContextProviderType.UnitOfWork` claims the Unit of Work module and connects this context to the current ambient scope.

## Run one explicit transaction

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

Prefer `RunAsync(...)` when the operation needs one normal transactional boundary. Use `BeginScope(...)` only when code needs manual flushes or completion callbacks.
