---
title: Quick Start
description: 安装并启用 Configuration UI。
sidebar_position: 2
---

# Quick Start

## 安装包

```bash
dotnet add package Monica.Configuration.UI
```

## 最小注册

```csharp
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

Mo.AddConfiguration();
Mo.AddConfigurationUI();

builder.UseMonica();

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

`Mo.AddConfigurationUI()` 会自动声明对 `Mo.AddConfiguration()`、Localization 和 Shell UI 的依赖。显式调用 `Mo.AddConfiguration()` 仍然推荐，因为它让宿主入口更清晰。

## 第一次打开页面

启动应用后打开：

```text
/configuration/state
```

如果项目中已经有带 `[Configuration]` 的 Options 类型，页面会展示配置定义列表、schema tree 和当前有效值。默认可写来源是 `memory:default`，所以开发环境可以直接尝试编辑和保存。

## 接下来读什么

- [Configuration UI 配置](./configuration.md)
- [Configuration 核心模块](../configuration/index.md)
- [Configuration Provider](../configuration/guide-and-providers.md)
