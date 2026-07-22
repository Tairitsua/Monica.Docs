---
title: 模块文档
description: 按 Monica 模块与发布成熟度组织的简体中文文档目录。
sidebar_position: 3
---

# 模块文档

这一层按照**模块**而不是旧历史目录来组织。一个 NuGet 包可以包含多个内聚的 Monica 模块，但每个模块仍然拥有独立注册契约和文档入口。表中的 `monica` 是 `builder.AddMonica(monica => { ... })` 回调参数。第三方包的组织方式见[多模块包架构](../ecosystem/multi-module-package-architecture.md)。

发布成熟度分为三层：Stable 是 Monica 1.0 的受支持应用路径；Integrations 是围绕外部系统的版本化适配；Labs 用于刻意快速演进、仍可能发生破坏性调整的能力。

## 当前已整理模块

| 模块 | 成熟度 | 包 | 注册入口 | 相关 UI 模块 |
|---|---|---|---|---|
| [AutoModel](./auto-model/index.md) | Stable | `Monica.AutoModel` | `monica.AddAutoModel()` | 无 |
| [AutoControllers](./auto-controllers/index.md) | Stable | `Monica.WebApi` | `monica.AddAutoControllers(...)` | 无 |
| [AI](./ai/index.md) | Labs | `Monica.AI` | `monica.AddAI()` | `monica.AddAIUI()` |
| [AI UI](./ai-ui/index.md) | Labs | `Monica.AI.UI` | `monica.AddAIUI()` | 无 |
| [AI Skill System](./ai-skill-system/index.md) | Labs | `Monica.AI` | `monica.AddAISkillSystem()` | `monica.AddAIUI()` |
| [Configuration](./configuration/index.md) | Stable | `Monica.Configuration` | `monica.AddConfiguration()` | `monica.AddConfigurationUI()` |
| [Configuration UI](./configuration-ui/index.md) | Stable | `Monica.Configuration.UI` | `monica.AddConfigurationUI()` | 无 |
| [DataChannel](./data-channel/index.md) | Labs | `Monica.DataChannel` | `monica.AddDataChannel()` | `monica.AddDataChannelUI()` |
| [DependencyInjection](./dependency-injection/index.md) | Stable | `Monica.DependencyInjection` | `monica.AddDependencyInjection()` | `monica.AddDependencyInjectionUI()` |
| [EventBus](./event-bus/index.md) | Stable | `Monica.EventBus` | `monica.AddEventBus()` | `monica.AddEventBusUI()` |
| [JobScheduler](./job-scheduler/index.md) | Stable | `Monica.JobScheduler` | `monica.AddJobScheduler()` | `monica.AddJobSchedulerUI()` |
| [Logging](./logging/index.md) | Stable | `Monica.Logging` | `monica.AddLogging()` | `monica.AddLoggingUI()` |
| [KnowledgeBase](./knowledge-base/index.md) | Labs | `Monica.AI` | `monica.AddKnowledgeBase()` | `monica.AddKnowledgeBaseUI()` |
| [KnowledgeBase UI](./knowledge-base-ui/index.md) | Labs | `Monica.AI.UI` | `monica.AddKnowledgeBaseUI()` | 无 |
| [MCP](./mcp/index.md) | Labs | `Monica.AI` | `monica.AddMcp()` | `monica.AddAIUI()` |
| [ProjectUnits](./project-units/index.md) | Stable | `Monica.ProjectUnits` | `monica.AddProjectUnits()` | `monica.AddProjectUnitsUI()` |
| [RAG](./rag/index.md) | Labs | `Monica.AI` | `monica.AddRAG()` | `monica.AddRAGUI()` |
| [RAG UI](./rag-ui/index.md) | Labs | `Monica.AI.UI` | `monica.AddRAGUI()` | 无 |
| [Repository](./repository/index.md) | Stable | `Monica.Repository` | `monica.AddRepository()` | 无 |
| [SignalR](./signalr/index.md) | Integrations | `Monica.SignalR` | `monica.AddSignalR()` | `monica.AddSignalRUI()` |
| [UnitOfWork](./unit-of-work/index.md) | Stable | `Monica.Repository` | `monica.AddUnitOfWork()` | 无 |

## 阅读建议

- 先看模块 `index.md` 了解定位与公开边界
- 再看 `quick-start.md` 跑通最小接入
- 然后阅读 `configuration.md` 与 `guide-and-providers.md`
- 如果你在做真实业务集成，再看 `scenarios.md`
