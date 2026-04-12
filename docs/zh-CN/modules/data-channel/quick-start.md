---
title: Quick Start
description: 安装并注册 DataChannel。
sidebar_position: 2
---

# Quick Start

## 安装包

```bash
dotnet add package Monica.DataChannel
```

## 最小注册

```csharp
using Monica.DataChannel.Abstractions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

Mo.AddDataChannel(o =>
{
    o.RecentExceptionToKeep = 20;
})
.SetChannelBuilder<DemoDataChannelSetup>();

builder.UseMonica();

public sealed class DemoDataChannelSetup : IDataChannelSetup
{
    public void Setup()
    {
        // 在这里创建并注册 DataChannel pipeline。
    }
}
```

## 第一个有价值的配置

`DataChannel` 的第一个关键配置不是某个布尔开关，而是**提供一个 `IDataChannelSetup` 实现**。模块会在启动阶段自动调用它来完成 channel 构建与注册。

## 接下来读什么

- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
