---
title: Guide and Providers
description: ProjectUnits 的 Guide 方法、发现范围、依赖关系，以及每种项目单元的编写入口。
sidebar_position: 4
---

# Guide and Providers

## Guide methods

这个模块没有额外公开的 Guide 方法，通常直接通过 `Mo.AddProjectUnits()` 进入即可。

## Provider choices

| Choice | How to enable it | When to use it |
|---|---|---|
| XML 文档细节解析 | `ParseUnitDetails = true`（默认） | 你希望单元详情包含更多描述、方法信息和文档注释时。 |
| 请求过滤能力 | `EnableRequestFilter = true` | 你需要通过模块管理请求过滤状态时。 |
| 运维 UI | `Mo.AddProjectUnitsUI()` | 需要可视化查看项目单元、依赖关系和枚举信息时。 |

## Module dependencies

- `ParseUnitDetails = true` 时会自动声明 XML Documentation 模块依赖。
- 模块始终会依赖 EventBus，以支持领域事件相关能力。

## 项目单元的编写入口

`ProjectUnits` 自己不定义 `ApplicationService`、`DomainService` 或 `DomainEventHandler` 这些基类，它负责识别它们。真正的编写入口主要来自 `Monica.WebApi`、`Monica.Repository`、`Monica.EventBus`、`Monica.JobScheduler` 与 `Monica.Configuration`。

| 单元 | 主要入口 | 典型位置 |
|---|---|---|
| `RequestDto` | `IResultRequest<T>` / `IResultRequest` | `Shared/.../PublishedLanguages/.../Requests/` |
| `ApplicationService` | `ApplicationService<TRequest, TResponse>` / `ApplicationService<TRequest>` | `Application/HandlersCommand/`、`Application/HandlersQuery/` |
| `ApplicationService`（CRUD 风格） | `CrudApplicationService<...>` | 应用层里的专用 CRUD 服务目录 |
| `DomainService` | `DomainService` | `DomainServices/` |
| `Repository` | `IRepository<TEntity, TKey>` 或自定义仓储抽象 | `Interfaces/` + `Repository/` |
| `DomainEvent` | `DomainEvent` | `PublishedLanguages/.../Events/` |
| `DomainEventHandler` | `DomainEventHandler<TEvent>` | `Application/HandlersEvent/` |
| `LocalEventHandler` | `LocalEventHandler<TEvent>` | `Application/HandlersEvent/` |
| `RecurringJob` | `RecurringJob` | `Application/BackgroundWorkers/` |
| `TriggeredJob` | `TriggeredJob<TArgs>` | `Application/BackgroundWorkers/` |
| `Configuration` | `[Configuration]` + `*Options` | `Configurations/` |

其中 `Configuration` 还有一个容易漏掉的宿主约束：如果某个 `*Options` 需要在后续模块注册代码里立即使用，必须先执行 `Mo.AddConfiguration(...)`，再调用 `Mo.RegisterInstantly(builder)`；否则它仍会等到默认模块批量注册阶段才真正可用。

## `Handler` 风格与 `CrudService` 风格

最常见的误解，是把所有“应用服务”都看成同一种东西。实际上：

- `CommandHandler*` / `QueryHandler*` 这类 `ApplicationService` 更适合表达业务用例
- `CrudApplicationService` 更适合表达资源型 CRUD HTTP 接口

如果你也采用混合模式，建议：

- 复杂业务动作继续写成显式 `RequestDto` + `ApplicationService`
- 纯资源 CRUD 再交给 `CrudApplicationService`
- 默认沿用 `CrudControllerPostfix = "CrudService"`，如果宿主改了后缀，类名必须同步调整

## `ProjectUnits` 实际会分析什么

除了识别类型本身，它还会继续分析：

- 构造函数依赖，用来建立项目单元关联图
- 公共方法元数据
- XML 文档注释（当 `ParseUnitDetails = true` 时）
- 领域事件与事件处理器之间的关联
- 配置类与 `IOptions<T>` / `IOptionsSnapshot<T>` / `IOptionsMonitor<T>` 的依赖关系

这也是为什么推荐你把项目单元边界写清楚，而不要把业务逻辑藏进一些没有明确角色的帮助类里。

## 深入阅读

- [项目单元编写](../../concepts/project-unit-authoring.md)
- [AutoControllers](../auto-controllers/index.md)
