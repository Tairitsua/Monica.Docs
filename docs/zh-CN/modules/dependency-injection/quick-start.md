---
title: Quick Start
description: 安装并注册 DependencyInjection。
sidebar_position: 2
---

# Quick Start

## 安装包

```bash
dotnet add package Monica.DependencyInjection
```

## 最小注册

```csharp
using Monica.DependencyInjection.Abstractions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

Mo.AddDependencyInjection();

builder.UseMonica();

public interface IClockService
{
    DateTime Now { get; }
}

public sealed class ClockService : IClockService, ISingletonDependency
{
    public DateTime Now => DateTime.UtcNow;
}
```

## 第一个有价值的配置

默认情况下，你通常只需要注册模块本身。只有在你准备排查自动注册细节时，才建议打开 `EnableAutoRegistrationLogging`。

## 接下来读什么

- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
