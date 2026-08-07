---
title: 注册第一个模块
description: 理解 `builder.AddMonica(...)`、`app.UseMonica()` 和 `app.MapMonica()` 的最小闭环。
sidebar_position: 5
---

如果你只想先跑通 Monica 的最小主机闭环，可以从配置简单的 `DependencyInjection` 与 `EventBus` 开始。所有注册都属于当前宿主，不会写入进程级共享状态。

## 最小示例

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddDependencyInjection();
    monica.AddEventBus().UseNoOpDistributedEventBus();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

## 这个示例里发生了什么

- `builder.AddMonica(...)`：创建并封闭当前宿主的 Monica 模块图；回调返回前会记录、校验并排序模块与依赖
- `monica.AddDependencyInjection()`：启用 Monica 约定式依赖注入
- `monica.AddEventBus()`：注册本地事件总线
- `UseNoOpDistributedEventBus()`：补上一个空操作分布式总线，避免宿主在开发期还没接入真实分布式基础设施时缺少实现
- `app.UseMonica()`：把 Monica 中间件接入已经构建的 Web 主机
- `app.MapMonica()`：映射当前模块图声明的 Monica 端点

## 什么时候使用注册扩展

当模块除了“注册自己”之外，还要求选择 Provider、增加服务、映射 Hub 或满足必需 Feature 时，会在 `ModuleRegistration<,>` 上暴露链式扩展。扩展链必须在同一个 `AddMonica(...)` 回调里完成；回调结束后 Registration 与模块图都会被封闭。

典型例子：

- `monica.AddJobScheduler().UseInMemoryMetadataRepository().UseSchedulerScope("local").UseInMemoryProvider()`
- `monica.AddSignalR().AddSignalR<...>().MapSignalRHub<THub>(...)`
- `monica.AddDataChannel().UseSetup<TSetup>()`

## 下一步

- [Module 模式](../concepts/module-pattern.md)
- [Option 与注册扩展](../concepts/configuration-and-guide.md)
