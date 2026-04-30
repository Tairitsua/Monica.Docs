---
title: Configuration
description: MCP 模块选项、本地 Server 发现规则和外部 Client 行为。
sidebar_position: 3
---

# Configuration

## Module options

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `McpHttpEndpointPath` | `string` | `"/mcp"` | 否 | 需要改变应用内 MCP 路由时 | 通过 `ConfigureMcpHttpEndpoint(...)` 设置。 |
| `McpHttpDisplayUrl` | `string?` | `null` | 否 | 外部可访问 URL 与本地路由不同 | 管理 UI 展示用途。 |
| `McpHttpStateless` | `bool` | `true` | 否 | 需要有状态 Streamable HTTP 会话时 | 默认使用 stateless HTTP。 |

## Local server options

本地 MCP Server 通过重写属性控制可用性：

| Property | Default | Meaning |
|---|---|---|
| `Definition` | 必须实现 | MCP server 的稳定名称、说明和版本等元数据。 |
| `RequiredModules` | `[]` | 只有所需模块都加载时，该 server 才可用。 |
| `IsEnabled` | `true` | 静态开关；为 `false` 时会在目录中显示为不可用。 |
| `TransportKind` | `Http` | 选择 HTTP 或 stdio 暴露方式。 |
| `IsLocalToolEnabled` | `false` | 是否同时作为 Monica 本地 Agent 工具。 |
| `SerializerOptions` | `null` | 自定义工具参数和返回值序列化。 |

## External client options

外部 MCP Client 通过 `AddMcpClient(...)` 注册。`isAgentToolEnabled` 默认是 `true`，表示列出的外部 MCP 工具可以被 Monica Agent 调用；设为 `false` 时仍可进入 MCP 目录和管理视图，但不进入 Agent 工具集。

## Required setup

本模块没有必需 Guide 配置。若要让本地 MCP server 通过 HTTP 暴露，需要宿主是 Web Host，且至少发现一个 `TransportKind == Http` 的可用 server。
