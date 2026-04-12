---
title: Quick Start
description: 安装并注册 SignalR。
sidebar_position: 2
---

# Quick Start

## 安装包

```bash
dotnet add package Monica.SignalR
```

## 最小注册

```csharp
using Microsoft.AspNetCore.SignalR;
using Monica.Authority.Identity.Abstractions;
using Monica.Modules;
using Monica.SignalR.Abstractions;

var builder = WebApplication.CreateBuilder(args);

Mo.AddSignalR()
    .AddSignalR<IChatHubOperator, ChatHubOperator, IChatClientContract, ICurrentUser>()
    .MapSignalRHub<ChatHub>("/signalr/chat");

builder.UseMonica();

public interface IChatClientContract : ISignalRHubContract
{
    Task ReceiveMessage(string message);
}

public interface IChatHubOperator : ISignalRHubOperator<IChatClientContract, ICurrentUser>
{
}

public sealed class ChatHub(ISignalRConnectionRegistry connectionRegistry)
    : SignalRHub<IChatClientContract>(connectionRegistry)
{
}

public sealed class ChatHubOperator(
    IHubContext<ChatHub, IChatClientContract> hubContext,
    ISignalRConnectionRegistry connectionRegistry)
    : CurrentUserSignalRHubOperator<IChatClientContract, ChatHub>(hubContext, connectionRegistry),
      IChatHubOperator
{
}
```

## 第一个有价值的配置

先把**Hub 契约、Hub 本体、HubOperator**三者关系定清楚，再调用 `AddSignalR<...>()` 与 `MapSignalRHub<THub>(pattern)`。这个模块最重要的是强类型公开契约，而不是单纯把 `MapHub` 放到宿主里。

## 接下来读什么

- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
