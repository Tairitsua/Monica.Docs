---
title: MCP
description: 发现 Monica MCP Server，托管 HTTP / stdio MCP，并把外部 MCP Client 工具纳入 Agent 能力目录。
sidebar_position: 1
---

# MCP

`MCP` 模块让 Monica 应用既可以托管本地 MCP Server，也可以连接外部 MCP Client。模块会发现继承自 `McpServer<TSelf>` 的服务器，使用 Monica 的 `[SkillTool]` 方法生成 MCP 工具，并把本地和外部 MCP 条目统一收集到能力目录中。

## 何时使用这个模块

- 你要把 Monica 业务能力暴露为 MCP endpoint。
- 你要把外部 MCP server 的工具接入 Monica AI Chat。
- 你希望在 AI 能力管理页查看 MCP 工具、参数、连通性和启用状态。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.AI` |
| 注册入口 | `Mo.AddMcp()` |
| 相关 UI 模块 | `Mo.AddAIUI()` |

## 公开使用面

- `McpServer<TSelf>`：Monica MCP Server 作者使用的基类。
- `McpServerDefinition`：MCP server 的稳定名称、说明、版本、标题、初始化说明和文档链接。
- `McpServerTransportKind`：本地 server 选择 `Http` 或 `Stdio`。
- `McpClientRegistration`：外部 MCP Client 注册模型。
- `MonicaMcpCatalog`：本地和外部 MCP 条目的统一目录。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [AI](../ai/index.md)
- [AI UI](../ai-ui/index.md)
