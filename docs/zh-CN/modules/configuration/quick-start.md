---
title: Quick Start
description: 安装并注册 Configuration。
sidebar_position: 2
---

# Quick Start

## 安装包

```bash
dotnet add package Monica.Configuration
```

## 最小注册

```csharp
using Microsoft.Extensions.Options;
using Monica.Configuration.Annotations;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

Mo.AddConfiguration();

builder.UseMonica();

[Configuration("AppSettings")]
public sealed class AppSettings
{
    [OptionSetting("程序名称")]
    public string AppName { get; set; } = "Demo";
}

public sealed class HomeService(IOptionsSnapshot<AppSettings> options)
{
    public string ReadName() => options.Value.AppName;
}
```

## 第一个有价值的配置

对大多数项目来说，第一件事不是打开高级选项，而是直接调用 `Mo.AddConfiguration()`。模块会自动使用宿主的 `builder.Configuration` 作为配置管理器；只有需要替换为自定义 `IConfigurationManager` 时，才显式设置 `AppConfiguration`。

## 接下来读什么

- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
