---
title: ProjectUnits
description: 发现 Monica 项目单元，并为 ApplicationService、DomainService、事件、作业与配置建立统一约定。
sidebar_position: 1
---

# ProjectUnits

`ProjectUnits` 是 Monica 的运行时结构发现模块。它会扫描当前宿主里的请求、应用服务、领域服务、实体、仓储、领域事件、事件处理器、作业与配置，并把这些信息暴露给诊断接口和 UI。

对真实业务项目来说，它还有第二个价值：把“项目单元怎么写”固定成一套统一约定。像 `ApplicationService`、`DomainService`、`DomainEventHandler` 这些类型虽然定义在 `Monica.WebApi` 等模块里，但最终都会被 `ProjectUnits` 识别、连接和展示。

## 何时使用这个模块

- 你想在运行时查看当前项目有哪些请求、应用服务、领域服务、领域事件、作业和配置。
- 你希望对项目结构做命名治理、依赖诊断和结构可视化。
- 你希望团队围绕同一套 ProjectUnit 语言来编写业务代码。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.Framework` |
| 注册入口 | `Mo.AddProjectUnits()` |
| 相关 UI 模块 | `Mo.AddProjectUnitsUI()` |

## 它会识别哪些项目单元

| 单元 | 典型契约 | 用途 |
|---|---|---|
| `RequestDto` | `IResultRequest<TResponse>` / `IResultRequest` | 表达命令或查询输入 |
| `ApplicationService` | `ApplicationService<TRequest, TResponse>` / `ApplicationService<TRequest>` | 编排用例边界并返回 `Res` |
| `DomainService` | `DomainService` | 复用领域规则 |
| `Entity` | `Entity<TKey>` / `IEntity` | 持有状态与行为 |
| `Repository` | `IRepository<TEntity, TKey>` 等 | 持久化访问 |
| `DomainEvent` | `DomainEvent` / `IDomainEvent` | 表达业务事实 |
| `DomainEventHandler` | `DomainEventHandler<TEvent>` | 响应分布式事件 |
| `LocalEventHandler` | `LocalEventHandler<TEvent>` | 响应进程内事件 |
| `RecurringJob` | `RecurringJob` 或其派生类 | 定时后台任务 |
| `TriggeredJob` | `TriggeredJob<TArgs>` 或其派生类 | 触发式后台任务 |
| `Configuration` | `[Configuration]` + `*Options` | 宿主配置 |

## 公开使用面与相关契约

- `ProjectUnitsFacade`：读取项目单元、领域事件与枚举元数据。
- `ModuleProjectUnitsOption`：开启命名约定与请求过滤等能力。
- `ProjectUnitNamingOptions`、`ProjectUnitNamingRule`、`ENameConventionMode`：描述命名治理规则。
- `ProjectUnit`、`DtoProjectUnit`、`DtoDomainEventInfo`：表示发现到的项目结构单元。
- `Monica.WebApi.Abstractions` 下的 `ApplicationService`、`DomainService`、`DomainEventHandler`、`LocalEventHandler` 与 `IResultRequest*`：是最常见的项目单元编写入口。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [项目单元编写](../../concepts/project-unit-authoring.md)
