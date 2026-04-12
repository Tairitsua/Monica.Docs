---
title: Scenarios
description: SignalR 的常见接入方式与使用陷阱。
sidebar_position: 5
---

# Scenarios

## 场景 1 — 用强类型 Contract 做服务端推送

最适合 Monica 的做法是把所有客户端可调用方法放到 `ISignalRHubContract` 上，然后在业务服务里注入 `IChatHubOperator` 之类的抽象，通过用户或连接维度推送。

## 场景 2 — 同时打开 Swagger 与调试 UI

在对接阶段，经常需要既让后端团队看到 Hub 契约，又让前端或测试人员快速调试连接。真实项目里，常见组合就是把 `AddSignalRSwagger(...)`、`MapSignalRHub<THub>("/signalr")` 和 `Mo.AddSignalRUI()` 一起打开。

```csharp
Mo.AddSignalRUI(o =>
{
    o.DefaultAccessToken = "<debug-token>";
});

Mo.AddSignalR()
    .AddSignalR<IChatHubOperator, ChatHubOperator, IChatClientContract, ICurrentUser>()
    .AddSignalRSwagger(_ =>
    {
        // 在这里配置需要扫描的程序集或 Swagger 选项。
    })
    .MapSignalRHub<ChatHub>("/signalr");
```

## Common mistakes

- 只调用 `MapSignalRHub<THub>()`，却没有先执行必需的 `AddSignalR<...>()`。
- 定义了 Hub 契约和 Operator，但没有实际映射任何 Hub 路由。
