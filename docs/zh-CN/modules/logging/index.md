---
title: Logging
description: 使用 Monica.Logging 配置宿主独立的 Serilog，并在业务代码中消费标准 ILogger。
sidebar_position: 1
---

# Logging

`Monica.Logging` 为当前宿主配置并持有一套 Serilog pipeline，同时把 Monica 组合阶段的诊断写入同一套日志。不同宿主不会共享或覆盖 Logger 状态。

## 安装与注册

```bash
dotnet add package Monica.Logging --prerelease
```

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddLogging(options =>
    {
        options.EnableConsoleSink = true;
        options.EnableFileSink = false;
        options.EnableTraceIdEnricher = true;
    });
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

Console 与 file sink 默认都启用。Thread ID enricher 默认启用，thread name 与 trace ID enricher 默认关闭。`LogFilePath` 可以指定完整日志路径；未设置时使用 `LogDirectory` 与 `LogFileName`。`CustomLoggerFactory` 用于替换 Monica 默认的 Serilog pipeline。

## 在业务代码中使用

- 普通 DI 服务继续注入 `ILogger<T>`。
- Monica 中继承 `ServiceBase` 的类型可以在方法中使用受保护的 `Logger`，包括 `ApplicationService`、`CustomApplicationService`、`DomainService`、`DomainEventHandler` 与 `LocalEventHandler`。Logger 在 DI 激活后才可用，不要在派生类构造函数里访问。
- 手工创建的 helper 如果需要日志，应由调用方显式传入 `ILogger`。

Monica 不提供进程级 `LogManager` 或“当前 LoggerFactory”。不要赋值 `Serilog.Log.Logger`，不要把宿主 Logger 缓存在 static mutable state，也不要为了取得日志而提前构建临时 `ServiceProvider`。

## HTTP 载荷日志

`AddRequestResponseLoggingMiddleware(disableResponse, disableRequest)` 是可选 Guide 能力。请求与响应正文可能包含凭据、个人数据或大体积载荷；只有在明确设计脱敏与保留策略后才应启用。
