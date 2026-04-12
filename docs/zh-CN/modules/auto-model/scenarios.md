---
title: Scenarios
description: AutoModel 的常见接入方式与使用陷阱。
sidebar_position: 5
---

# Scenarios

## 场景 1 — 直接对仓储查询应用动态过滤

如果你已经拿到了实体查询对象，可以直接注入 `IAutoModelDbOperator<TModel>`，把来自 UI 或 API 的过滤字符串作用到 `IQueryable<T>`。

```csharp
public sealed class UserQueryService(IAutoModelDbOperator<User> autoModel)
{
    public IQueryable<User> Apply(IQueryable<User> query)
    {
        return autoModel.ApplyFilter(query, "UserName like \"alice\"");
    }
}
```

## 场景 2 — 在启动阶段预热实体快照

真实项目里，常见做法是在启动预热、Seeder 或后台初始化阶段直接注入 `IAutoModelSnapshot<TModel>`。这样既能提前构建快照，也能顺手检查当前实体到底暴露了哪些激活名。

```csharp
public sealed class UserAutoModelWarmup(IAutoModelSnapshot<User> snapshot)
{
    public IReadOnlyList<string> ReadActivateNames()
    {
        return snapshot.GetAllActivateNames();
    }
}
```

## 场景 3 — 为自动 CRUD 限定可筛选字段

当你和 `AutoControllers` 或通用 CRUD 一起使用时，推荐启用 `EnableActiveMode` 并只给允许公开的字段加 `AutoFieldAttribute`。这样可以把“实体字段很多，但只开放一部分给查询端”这类需求固定下来。

## Common mistakes

- 开启 `EnableActiveMode` 后忘记给字段加 `AutoFieldAttribute`，导致看起来“所有筛选都失效”。
- 把内部解析 Provider 当成稳定公开扩展点；用户文档应优先依赖 `IAutoModel*` 抽象。
