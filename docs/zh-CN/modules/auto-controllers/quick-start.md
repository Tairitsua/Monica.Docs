---
title: Quick Start
description: 安装并注册 AutoControllers。
sidebar_position: 2
---

# Quick Start

## 安装包

```bash
dotnet add package Monica.WebApi
```

## 最小注册

```csharp
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

Mo.AddAutoControllers(
    crudOptionAction: o =>
    {
        o.RoutePath = "api/v1/[controller]";
    });

builder.UseMonica();

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

## 第一个有价值的配置

大多数项目最先需要调整的是 `CrudControllerOption.RoutePath`。先把 CRUD 控制器的统一前缀定下来，后续再决定是否修改默认类名后缀 `CrudService`。

如果你同时使用 `ApplicationService<TRequest, TResponse>` 这类 Handler 风格入口，建议再额外固定一条规则：

- 基础路由统一采用 `api/{version}/{DomainName(PascalCase)}`
- 模块化单体在 Domain 项目根目录放 `[assembly: AutoControllerConfig(...)]`
- 微服务在 `{Subdomain}Service.API/Program.cs` 放同样的配置
- 每个 Handler 方法只补充请求级路由，例如 `[HttpGet("tree")]`

## 接下来读什么

- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
