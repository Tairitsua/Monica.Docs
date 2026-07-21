---
title: Guide and Providers
description: 理解 AutoControllers 注册与 RPC 传输选择。
sidebar_position: 4
---

# Guide and Providers

## 运行时 Guide

`ModuleAutoControllersGuide` 没有额外必需方法。通过 `monica.AddAutoControllers(...)` 注册后，模块会接入 MVC 端点映射、API Explorer、普通 Controller 发现与 CRUD Controller 发现。

`ModuleAutoControllers` 声明了 `AutoModel` 依赖，用于约定式 CRUD 筛选。

## 生成器归属

`Monica.Generators.AutoController` 是编译期 Analyzer 依赖。每个编译端点请求或 `ApplicationService` Handler 的程序集都应私有引用它。生成器不会把 RPC snapshot 写入项目目录，也不要求先构建 Producer。

## RPC 运行时 Provider

同时生成两种传输并不等于选择运行时传输，宿主必须显式决定：

```csharp
builder.AddMonica(monica =>
{
    monica.AddRpcClient()
        .ConfigDomainInfoProvider(new AppRpcClientDomainInfoProvider())
        .UseLocalTransport();
});
```

- 调用方和提供方在同一进程时使用 `UseLocalTransport()`。
- 跨进程运行时使用 `UseHttpTransport()`，并配置 HTTP 注册 Provider。
- Domain Info Provider 决定当前宿主要注册哪些生成客户端。
