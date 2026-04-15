---
title: AutoControllers
description: 自动发现 `ControllerBase` 与 CRUD 应用服务，统一接入 ASP.NET Core Controller 路由与 API 描述生成。
sidebar_position: 1
---

# AutoControllers

自动发现 `ControllerBase` 与 CRUD 应用服务，统一接入 ASP.NET Core Controller 路由与 API 描述生成。

## 何时使用这个模块

- 你想让 Monica 自动发现控制器，而不是手工维护 MVC ApplicationPart。
- 你正在使用基于 `ICrudApplicationService` 的自动 CRUD 控制器生成。
- 你希望在一个模块里同时容纳手写 Controller 与约定式 CRUD API。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.WebApi` |
| 注册入口 | `Mo.AddAutoControllers(...)` |
| 相关 UI 模块 | 无 |

## 公开使用面

- `ApplicationService` / `ApplicationService<TRequest, TResponse>`：面向请求处理的应用服务基类。
- `CrudApplicationService<...>`：面向标准资源 CRUD 的应用服务基类。
- `ICrudApplicationService`：标记可参与自动 CRUD 控制器生成的服务类型。
- `CrudControllerOption`：配置自动 CRUD 路由前缀与类名后缀规则。
- `AutoControllerConfigAttribute`：在程序集级统一默认路由前缀、领域名和生成行为。
- `IResultRequest`：与结果模型配套的请求契约。

默认推荐的 `ApplicationService` 路由写法是：先用 `AutoControllerConfigAttribute` 固定 `api/{version}/{DomainName(PascalCase)}`，再在 Handler 方法上补充 `tree`、`publish`、`doc` 这类请求级路由片段。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [项目单元编写](../../concepts/project-unit-authoring.md)
