---
title: Quick Start
description: 注册 MCP 模块并定义第一个 Monica MCP Server。
sidebar_position: 2
---

# Quick Start

## 安装包

```bash
dotnet add package Monica.AI
```

## 最小注册

```csharp
using Monica.Modules;

Mo.AddMcp();
```

`Mo.AddAI()` 会自动依赖并注册 MCP 模块。需要单独托管 MCP endpoint 或提前配置 MCP endpoint 路径时，可以显式调用 `Mo.AddMcp()`。

## 定义本地 MCP Server

```csharp
using Monica.AI.Mcp.Abstractions;
using Monica.AI.Mcp.Models;
using Monica.Core.Skills.Annotations;

public sealed class FlightMcpServer : McpServer<FlightMcpServer>
{
    public override McpServerDefinition Definition { get; } = new(
        "flight-mcp",
        "Flight operation MCP tools.")
    {
        Title = "Flight MCP",
        Version = "1.0.0"
    };

    public override McpServerTransportKind TransportKind => McpServerTransportKind.Http;

    public override bool IsLocalToolEnabled => true;

    [SkillTool(Description = "Returns a short flight status.")]
    public Task<string> GetFlightStatusAsync(
        [SkillTool(Description = "Flight number, for example CA1234.")]
        string flightNo,
        IServiceProvider services)
    {
        return Task.FromResult($"Flight {flightNo} is operating normally.");
    }
}
```

## 配置 HTTP endpoint

```csharp
Mo.AddMcp()
    .ConfigureMcpHttpEndpoint(
        endpointPath: "/mcp",
        displayUrl: "https://example.com/mcp",
        stateless: true);
```

ASP.NET Core Host 仍负责监听地址、端口和 TLS。`endpointPath` 只是应用内路由。

## 接下来读什么

- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [AI UI](../ai-ui/index.md)
