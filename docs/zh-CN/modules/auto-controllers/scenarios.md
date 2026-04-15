---
title: Scenarios
description: AutoControllers 的常见接入方式与使用陷阱。
sidebar_position: 5
---

# Scenarios

## 场景 1 — 统一 CRUD 路由前缀

在多模块宿主里，最常见的做法是先把 CRUD 控制器统一放到一个前缀下，例如 `api/v1/[controller]`。这样 UI、前端 SDK 与文档都更容易保持一致。

## 场景 2 — 用程序集级 `AutoControllerConfigAttribute` 固定默认路由

真实项目里，除了在 `Mo.AddAutoControllers(...)` 里改 `CrudControllerOption`，还常常会在程序集级用 `AutoControllerConfigAttribute` 统一默认路由前缀和领域名。这样生成器与宿主注册入口都能围绕同一套路由约定工作。

推荐把 `ApplicationService` 的基础路由固定成 `api/{version}/{DomainName(PascalCase)}`，然后让每个 Handler 方法只声明自己的请求级路由片段。

```csharp
using Monica.WebApi.AutoControllers.Annotations;

[assembly: AutoControllerConfig(
    DefaultRoutePrefix = "api/v1",
    DomainName = "Documentation")]
```

例如：

- `QueryHandlerGetDocTree` + `[HttpGet("tree")]` -> `GET api/v1/Documentation/tree`
- `QueryHandlerGetDocBySlug` + `[HttpGet("doc")]` -> `GET api/v1/Documentation/doc?slug={slug}`

放置位置也建议固定：

- 模块化单体：写在每个 Domain 项目根目录的独立配置文件里
- 微服务：写在 `{Subdomain}Service.API/Program.cs` 里

## 场景 3 — 混合使用手写 Controller 与自动 CRUD

如果某些资源只需要标准 CRUD，可以交给 `ICrudApplicationService`；而那些需要特殊动作、流式接口或复杂授权的资源，则继续保留手写 `ControllerBase`。`AutoControllers` 会同时发现两者。

## Common mistakes

- 修改了 `CrudControllerPostfix`，但已有 CRUD 服务类名仍沿用旧后缀，结果不会被发现。
- 误以为该模块会自动暴露所有业务类；实际上只有 `ControllerBase` 与 `ICrudApplicationService` 才在公开发现范围内。
