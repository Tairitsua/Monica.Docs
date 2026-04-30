---
title: Guide and Providers
description: MCP 模块的 Guide 方法、传输选择和依赖说明。
sidebar_position: 4
---

# Guide and Providers

## Guide methods

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `ConfigureMcpHttpEndpoint(...)` | 配置本地 MCP HTTP endpoint 路径、显示 URL 和 stateless 模式 | 否 | 需要公开 `/mcp` 以外路径，或管理 UI 要展示外部 URL 时。 |
| `AddMcpClient(...)` | 注册外部 MCP Client 并收集远端工具 | 否 | 把文件系统、浏览器、数据库等外部 MCP 工具接入 Monica Agent。 |

## Transport choices

| Choice | How to enable it | When to use it |
|---|---|---|
| HTTP | `McpServer.TransportKind => McpServerTransportKind.Http` | Web Host 中对外暴露 MCP endpoint。 |
| Stdio | `McpServer.TransportKind => McpServerTransportKind.Stdio` | 本地 Agent 测试或 stdio MCP 工具链。 |
| Local agent tool | `McpServer.IsLocalToolEnabled => true` | 希望同一套 MCP 工具也能被 Monica AI Chat 直接调用。 |
| External client | `AddMcpClient(...)` | 连接外部 MCP server 并把工具收集到 Monica 目录。 |

## Module dependencies

| Dependency | Why it is used |
|---|---|
| `Mo.AddXmlDocumentation()` | 为 MCP 工具和参数生成说明。 |
| `Mo.AddAI()` | 提供 Agent 工具接入、能力启用状态和聊天运行时。 |
| `Mo.AddAIUI()` | 提供 MCP 目录展示、连通性测试和全局/单项启停 UI。 |

## Tool metadata

MCP 工具使用与 Skill 相同的 `[SkillTool]` 发现机制。方法可以是实例或静态方法，参数描述可以来自 `[SkillTool(Description = ...)]` 或 XML 注释。工具名重复会在目录构建阶段失败。
