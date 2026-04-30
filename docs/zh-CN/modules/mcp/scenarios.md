---
title: Scenarios
description: MCP 模块的典型托管、连接和管理场景。
sidebar_position: 5
---

# Scenarios

## 场景 1 — 把业务工具暴露为 MCP endpoint

为业务模块定义 `McpServer<TSelf>`，把稳定查询方法标记为 `[SkillTool]`，并使用 HTTP transport。外部 MCP Client 连接应用的 `/mcp` endpoint 后即可发现这些工具。

## 场景 2 — 本地测试时让 MCP 工具直接进入 AI Chat

将 `IsLocalToolEnabled` 设为 `true`，工具会同时出现在 Monica Agent 工具集中。这个模式适合本地 Agent 测试，但生产环境应谨慎扩大可调用面。

## 场景 3 — 接入外部 MCP Client

使用 `AddMcpClient(...)` 注册一个连接工厂。MCP Catalog 会按需创建 client、列出工具，并在能力管理页中显示工具和连通性状态。

## Common mistakes

- 混淆 `McpHttpEndpointPath` 和真实监听 URL；前者是 ASP.NET Core 路由，端口和 TLS 由 Host 配置。
- 本地 MCP Server 没有任何 `[SkillTool]` 方法，导致 endpoint 可用但无工具。
- 忘记 `IsLocalToolEnabled` 默认是 `false`，以为所有本地 MCP 工具都会自动进入 AI Chat。
