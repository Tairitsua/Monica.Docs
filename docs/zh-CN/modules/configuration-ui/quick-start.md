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

Mo.AddConfiguration()
    .UseFileConfigurationStore();
Mo.AddConfigurationUI();

builder.UseMonica();

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

`Mo.AddConfigurationUI()` 会自动声明对 `Mo.AddConfiguration()`、Localization 和 Shell UI 的依赖。核心配置模块仍然需要显式选择 file 或 DB store。

## 第一次打开页面

启动应用后打开：

```text
/configuration/state
```

如果项目中已经有带 `[Configuration]` 的 Options 类型，页面会展示配置定义列表、schema tree 和当前有效值。配置状态页可以暂存多个修改，并作为一个审计组保存。

Storage 页面位于：

```text
/configuration/providers
```

路由名保留为 `providers`，页面内容显示的是当前 active store bundle，而不是旧的 source priority 列表。

## 接下来读什么

- [Configuration UI 配置](./configuration.md)
- [Configuration 核心模块](../configuration/index.md)
- [Configuration Store](../configuration/guide-and-providers.md)
