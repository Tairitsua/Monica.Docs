---
title: 构建最小 Monica API 主机
description: 用几个基础模块拼出一个可运行的 Monica API 主机。
sidebar_position: 1
---

# 构建最小 Monica API 主机

如果你想快速搭一个“既有 Monica 模块、又能承载 Web API”的宿主，可以从下面这个组合开始。

## 推荐起步组合

- `DependencyInjection`：自动注册业务服务
- `EventBus`：统一本地 / 分布式事件抽象
- `Configuration`：绑定和管理配置类型
- `AutoControllers`：自动暴露 CRUD / Controller
- `ProjectUnits`：查看结构信息与命名治理

## 示例

```csharp
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

Mo.AddDependencyInjection();

Mo.AddEventBus()
    .UseNoOpDistributedEventBus();

Mo.AddConfiguration();

Mo.AddAutoControllers(
    crudOptionAction: o =>
    {
        o.RoutePath = "api/v1/[controller]";
    });

Mo.AddProjectUnits(o =>
{
    o.ConventionOptions.EnableNameConvention = true;
});

builder.UseMonica();

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

## 什么时候继续加模块

- 需要数据库访问：加 `Repository` / `UnitOfWork`
- 需要后台作业：加 `JobScheduler`
- 需要实时推送：加 `SignalR`
- 需要数据通道运维：加 `DataChannel`
