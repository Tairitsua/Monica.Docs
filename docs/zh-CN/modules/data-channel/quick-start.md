---
title: Quick Start
description: 安装并注册 DataChannel。
sidebar_position: 2
---

## 安装包

```bash
dotnet add package Monica.DataChannel
```

## 最小注册

```csharp
using Monica.DataChannel.Abstractions;
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddDataChannel(o =>
    {
        o.RecentExceptionToKeep = 20;
    })
    .UseSetup<DemoDataChannelSetup>();
});

public sealed class DemoDataChannelSetup : IDataChannelSetup
{
    public void Setup(IDataChannelRegistrar channels)
    {
        channels.Add("demo", pipeline =>
            pipeline.SetOuterEndpoint(new DaprBindingOptions(
                EDaprBindingType.Kafka,
                ConnectionDirection.Output)
            {
                OutputBindingName = "demo-output"
            }));
    }
}
```

## 第一个有价值的配置

`DataChannel` 的第一个关键配置不是某个布尔开关，而是**提供一个 `IDataChannelSetup` 实现**。模块会在启动阶段把当前宿主的 `IDataChannelRegistrar` 传给它，再完成 channel 构建与注册。

## 接下来读什么

- [Configuration](./configuration.md)
- [注册扩展与 Provider](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
