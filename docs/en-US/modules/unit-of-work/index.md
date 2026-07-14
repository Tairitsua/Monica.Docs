---
title: Unit of Work
description: Coordinate repository changes and publish work only after a successful commit.
sidebar_position: 1
---

# Unit of Work

The Unit of Work module lives in `Monica.Repository`. It coordinates transaction-scoped DbContexts, exposes `IUnitOfWorkManager`, installs the MVC action filter, and supports callbacks that run only after successful completion.

```bash
dotnet add package Monica.Repository --prerelease
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
```

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

Selecting `DbContextProviderType.UnitOfWork` adds `ModuleUnitOfWork` and the adaptive provider automatically. Register `monica.AddUnitOfWork()` directly only when you need its options without a Unit-of-Work-backed repository context.

```csharp
await using var unitOfWork = unitOfWorkManager.BeginScope();

await repository.InsertAsync(order, cancellationToken);
unitOfWork.OnCompleted(() =>
    localEventBus.PublishAsync(new OrderApproved(order.Id)));

await unitOfWork.CompleteAsync(cancellationToken);
```

Use `OnCompleted(...)` for event publication or external follow-up that must not occur if the transaction rolls back. `EnableEntityEvent` is `false` by default; enable it only when entity change events are part of the application's explicit domain contract.

Repository `SaveChangesAsync()` inside an active unit of work flushes through the unit rather than committing the transaction independently.
