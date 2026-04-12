---
title: 注册第一个模块
description: 理解 `Mo.Add*()`、`builder.UseMonica()` 和 `app.MapMonica()` 的最小闭环。
sidebar_position: 3
---

# 注册第一个模块

如果你只想先跑通 Monica 的最小主机闭环，推荐从**配置最简单的模块**开始，例如 `DependencyInjection` 或 `EventBus`。

## 最小示例

```csharp
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

Mo.AddDependencyInjection();
Mo.AddEventBus().UseNoOpDistributedEventBus();

builder.UseMonica();

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

## 这个示例里发生了什么

- `Mo.AddDependencyInjection()`：启用 Monica 约定式依赖注入
- `Mo.AddEventBus()`：注册本地事件总线
- `UseNoOpDistributedEventBus()`：补上一个空操作分布式总线，避免宿主在开发期还没接入真实分布式基础设施时缺少实现
- `builder.UseMonica()`：收束模块注册、依赖、端点和应用管道配置
- `app.UseMonica()` / `app.MapMonica()`：真正把模块行为接到运行时主机中

## 什么时候需要 `ModuleGuide`

当一个模块除了“注册自己”之外，还要求你继续声明 Provider、额外服务、Hub 映射或必需配置时，就会通过 `ModuleGuide` 暴露链式 API。

典型例子：

- `Mo.AddJobScheduler().UseInMemoryMetadataRepository().UseSchedulerScope("local").UseInMemoryProvider()`
- `Mo.AddSignalR().AddSignalR<...>().MapSignalRHub<THub>(...)`
- `Mo.AddDataChannel().SetChannelBuilder<TSetup>()`

## 下一步

- [Module 模式](../concepts/module-pattern.md)
- [Option 与 Guide 配置方式](../concepts/configuration-and-guide.md)
