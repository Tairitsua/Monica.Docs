---
title: 安装与主机接入
description: 安装 Monica 包并接入统一的主机启动流程。
sidebar_position: 2
---

# 安装与主机接入

Monica 不要求你一次性安装整套框架。通常的做法是：**先安装你真正需要的模块包，再把它们通过 `Mo.Add*()` 注册到主机中。**

## 你至少需要知道的模式

Monica 主机通常遵循下面的三段式流程：

1. 在 `builder` 阶段调用 `Mo.Add*()` 注册模块
2. 在 `builder` 阶段调用 `builder.UseMonica()` 完成 Monica 主机构建
3. 在 `app` 阶段调用 `app.UseMonica()` / `app.MapMonica()` 让模块端点与中间件生效

## 安装包

```bash
dotnet add package Monica.Core
dotnet add package Monica.DependencyInjection
dotnet add package Monica.EventBus
```

只安装需要的包即可。后续如果要接入仓储、作业调度、SignalR 或配置管理，再补对应的模块包。

## 最小主机骨架

```csharp
using Monica.Core;
using Monica.Core.Modularity.Extensions;
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

## 什么时候需要继续往下配

- 只要模块有 `ModuleOption`，你就可以在 `Mo.Add*()` 的 lambda 中配置它
- 只要模块有 `ModuleGuide`，你就可以继续链式调用启用附加能力
- 只要模块存在配套 UI 模块，通常都应该把基础设施模块和 UI 模块分开理解、按需组合

## 下一步

- [注册第一个模块](./first-module.md)
- [理解 Monica 模块模式](../concepts/module-pattern.md)
