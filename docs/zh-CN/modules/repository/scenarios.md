---
title: Scenarios
description: Repository 的常见接入方式与使用陷阱。
sidebar_position: 5
---

# Scenarios

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

## Common mistakes

- 只注册了 `Mo.AddRepository()`，却忘了调用 `AddRepositoryDbContext<TDbContext>(...)`。
- 把所有场景都切到 `ContextFactory` 或 `UnitOfWork`，而没有先从默认 Provider 开始。
