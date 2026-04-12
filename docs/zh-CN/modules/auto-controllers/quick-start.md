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

## 接下来读什么

- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
