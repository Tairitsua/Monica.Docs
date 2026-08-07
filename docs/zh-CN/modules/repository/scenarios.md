---
title: Scenarios
description: Repository 的常见接入方式与使用陷阱。
sidebar_position: 5
---

## 场景 1 — 用默认 Provider 跑通单 `DbContext` 仓储

对于大多数宿主，先使用 `DbContextProviderType.Default` 即可。它最贴近普通 EF Core 使用习惯，也最容易和标准请求生命周期对齐。

真实项目里，最常见的 Monica 原生仓储写法，是在自定义仓储里直接注入 `IDbContextProvider<TDbContext>`，再继承 `EfRepository<...>`：

```csharp
using Monica.Repository.Persistence.Abstractions;
using Monica.Repository.Persistence.Services;

public interface IUserRepository : IRepository<User, Guid>
{
}

public sealed class UserRepository(IDbContextProvider<AppDbContext> dbContextProvider)
    : EfRepository<AppDbContext, User, Guid>(dbContextProvider), IUserRepository
{
}
```

## 场景 2 — 把仓储切到 UnitOfWork Provider

如果一个业务流程需要多个仓储或多个操作共享统一事务边界，推荐把对应 `DbContext` 切到 `DbContextProviderType.UnitOfWork`，再让入口层显式创建或承接 UoW。

## 场景 3 — 在长生命周期服务中创建独立上下文

后台 Worker 或 singleton 服务不应该长期持有 scoped `DbContext`。直接注入 `IDbContextFactory<TDbContext>`，并处置每次创建的上下文：

```csharp
public sealed class OrderSnapshotWorker(
    IDbContextFactory<AppDbContext> dbContextFactory)
{
    public async Task CaptureAsync(CancellationToken cancellationToken)
    {
        await using var dbContext = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        var orderCount = await dbContext.Set<Order>().CountAsync(cancellationToken);
        // 保存或发布快照。
    }
}
```

该工厂由 `AddRepositoryDbContext<AppDbContext>(...)` 自动注册。每个上下文都拥有独立 DI scope；`await using` 会同时释放上下文和它拥有的 scope。

## Common mistakes

- 只注册了 `monica.AddRepository()`，却忘了调用 `AddRepositoryDbContext<TDbContext>(...)`。
- 把 scoped 仓储的 Provider 选择和 `IDbContextFactory<TDbContext>` 是否可用混为一谈；工厂始终随 `AddRepositoryDbContext(...)` 注册。
- 创建 factory context 后没有处置，导致它拥有的 DI scope 无法及时释放。
- 为同一个上下文再注册一套 `AddDbContextFactory<TDbContext>()`，使 Provider 配置和生命周期所有权变得不一致。
