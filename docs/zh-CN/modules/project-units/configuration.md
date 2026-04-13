---
title: Configuration
description: ProjectUnits 的公开选项、默认值，以及项目单元命名治理的配置方式。
sidebar_position: 3
---

# Configuration

## Module options

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `ConventionOptions` | `ProjectUnitNamingOptions` | `new()` | 否 | 你要启用或调整命名约定治理时 | 命名规则的总入口。 |
| `EnableRequestFilter` | `bool` | `false` | 否 | 你需要启用请求过滤中间件时 | 会额外接入请求过滤相关能力。 |
| `ParseUnitDetails` | `bool` | `true` | 否 | 你想关闭详细元数据解析以缩减处理量时 | 开启时会自动声明 XML Documentation 依赖，并尝试补充项目单元描述信息。 |

## 额外选项 `ProjectUnitNamingOptions`

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `Dict` | `Dictionary<EProjectUnitType, ProjectUnitNamingRule>` | `[]` | 否 | 你要为特定项目单元类型覆盖规则时 | 为不同单元类型单独设置命名或校验模式。 |
| `NameConventionMode` | `ENameConventionMode` | `Warning` | 否 | 你要设置全局命名校验模式时 | 默认只警告，不阻断启动。 |
| `EnableNameConvention` | `bool` | `false` | 否 | 你准备启用命名治理时 | 总开关。 |

## 项目单元命名治理的推荐起步方式

建议按下面的顺序启用：

1. 先打开 `EnableNameConvention`
2. 先保持 `NameConventionMode = Warning`
3. 清理历史代码后，再考虑局部或全局切到 `Strict`

```csharp
Mo.AddProjectUnits(o =>
{
    o.ConventionOptions.EnableNameConvention = true;
    o.ConventionOptions.NameConventionMode = ENameConventionMode.Warning;
});
```

## 混合使用显式 Handler 与 CRUD 服务时怎么配

`ProjectUnits` 的应用服务推荐命名是 `CommandHandler*` / `QueryHandler*` 这类 Handler 风格；而 `CrudApplicationService` 的默认类名后缀通常是 `CrudService`。这两种风格混用时，单一命名规则往往不够精确。

如果你的项目同时存在这两种风格，建议不要立刻把 `ApplicationService` 命名治理切到 `Strict`。一种稳妥做法是先对这一类单独关闭强校验：

```csharp
using Monica.Framework.ProjectUnits.Models;

Mo.AddProjectUnits(o =>
{
    o.ConventionOptions.EnableNameConvention = true;
    o.ConventionOptions.NameConventionMode = ENameConventionMode.Warning;
    o.ConventionOptions.Dict[EProjectUnitType.ApplicationService] = new ProjectUnitNamingRule
    {
        NameConventionMode = ENameConventionMode.Disable
    };
});
```

这会让你保留其它项目单元的治理能力，同时避免对 CRUD 风格应用服务产生误报。

## 典型推荐约定

下面这些不是“只有这样才会被发现”的硬限制，而是最适合长期协作的默认约定。

| 单元 | 推荐命名 | 推荐位置 |
|---|---|---|
| `RequestDto` | `Command*` / `Query*` / `Request*` | `Shared/.../PublishedLanguages/.../Requests/` |
| `ApplicationService` | `CommandHandler*` / `QueryHandler*` | `Application/HandlersCommand/`、`Application/HandlersQuery/` |
| `DomainService` | `Domain*` | `DomainServices/` |
| `Entity` | 放在 `Entities/` 下 | `Entities/` |
| `Repository` | `IRepository*` / `Repository*` | `Interfaces/` + `Repository/` |
| `DomainEvent` | `Event*` | `PublishedLanguages/.../Events/` |
| `DomainEventHandler` | `DomainEventHandler*` | `Application/HandlersEvent/` |
| `LocalEventHandler` | `LocalEventHandler*` | `Application/HandlersEvent/` |
| `RecurringJob` | `Worker*` | `Application/BackgroundWorkers/` |
| `TriggeredJob` | `Job*` | `Application/BackgroundWorkers/` |
| `Configuration` | `*Options` | `Configurations/` |
