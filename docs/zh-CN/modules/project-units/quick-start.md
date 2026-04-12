---
title: Quick Start
description: 安装并注册 ProjectUnits。
sidebar_position: 2
---

# Quick Start

## 安装包

```bash
dotnet add package Monica.Framework
```

## 最小注册

```csharp
using Monica.Framework.ProjectUnits.Models;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

Mo.AddProjectUnits(o =>
{
    o.ConventionOptions.EnableNameConvention = true;
    o.ConventionOptions.NameConventionMode = ENameConventionMode.Warning;
});

builder.UseMonica();
```

## 第一个有价值的配置

最值得优先决定的是：你是否要在当前项目启用命名约定治理。如果要启用，建议先从 `Warning` 模式开始，而不是一上来就用 `Strict`。

## 接下来读什么

- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
