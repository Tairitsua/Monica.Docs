---
title: Repository
description: Register EF Core contexts and consume typed repository contracts.
sidebar_position: 1
---

`Monica.Repository` provides EF Core-backed repository contracts, context discovery, sequential GUID generation, and host-local diagnostics. Repository write methods stage changes; call `SaveChangesAsync()` explicitly or let an active Unit of Work flush and commit them.

```bash
dotnet add package Monica.Repository --prerelease
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
```

```csharp
using Microsoft.EntityFrameworkCore;
using Monica.Core.Modularity.Extensions;
using Monica.DependencyInjection.Abstractions;
using Monica.Modules;
using Monica.Repository.Persistence.Services;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddRepository(options =>
    {
        options.EnableEfCoreConnectionMetrics = true;
    })
    .AddRepositoryDbContext<OrderingDbContext>((_, db) =>
        db.UseSqlite(builder.Configuration.GetConnectionString("Ordering")));
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();

public sealed class OrderingDbContext(
    DbContextOptions<OrderingDbContext> options,
    ICachedServiceProvider serviceProvider)
    : RepositoryDbContext<OrderingDbContext>(options, serviceProvider);
```

Inject `IRepository<TEntity, TKey>` for keyed entities or define a domain-specific interface that derives from it. `FindAsync` returns `null`; `GetAsync` throws when the entity does not exist. Set-based `ExecuteUpdateAsync` and `ExecuteDeleteAsync` execute immediately and do not update tracked instances.

| Option | Default | Effect |
|---|---|---|
| `EnableSensitiveDataLogging` | Development-dependent when `null` | Controls whether EF diagnostics include parameter values. Set explicitly in sensitive deployments. |
| `EnableEfCoreConnectionMetrics` | `false` | Emits connection lifecycle instruments; an exporter still must be configured. |
| `DisableEntitySelfConfiguration` | `false` | Stops entity-owned model configuration. |
| `DisableEntitySeparateConfiguration` | `false` | Stops discovery of separate `IEntityTypeConfiguration<TEntity>` types. |

## Factory-created contexts

Every `AddRepositoryDbContext<TDbContext>(...)` registration also exposes `IDbContextFactory<TDbContext>`. Each factory-created context owns an independent dependency injection scope, so the singleton factory is safe to inject into a background worker or another long-lived service. Dispose every created context to release that scope:

```csharp
public sealed class OrderSnapshotWorker(
    IDbContextFactory<OrderingDbContext> dbContextFactory)
{
    public async Task CaptureAsync(CancellationToken cancellationToken)
    {
        await using var dbContext = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        var orderCount = await dbContext.Set<Order>().CountAsync(cancellationToken);
        // Persist or publish the snapshot.
    }
}
```

`DbContextProviderType` controls how scoped repositories obtain their current context. Use `Default` for the request scope or `UnitOfWork` for Monica transaction boundaries; factory availability is independent of that choice. Do not layer another `AddDbContextFactory<TDbContext>()` registration over the same context—configure the provider through `AddRepositoryDbContext(...)`.

See [Unit of Work](../unit-of-work/index.md) for transaction-bound repository operations.
