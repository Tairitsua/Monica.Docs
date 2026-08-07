---
title: 包成熟度
description: 理解 Stable、Integrations、Labs 以及第三方兼容包之间的不同承诺。
sidebar_position: 1
---

成熟度标签描述官方 Monica 包的兼容预期与采用风险，并不意味着每个应用都应安装全部 Stable 包。

| 层级 | 承诺 | 代表能力 |
|---|---|---|
| **Stable** | Monica 1.0 受支持的应用路径 | Core、ProjectUnits、WebApi、Configuration、Repository、JobScheduler、OpenTelemetry、Testing、UI |
| **Integrations** | 围绕外部 Provider 边界的版本化适配器 | EF Core、Kafka、Redis/StackExchange、Dapr、SignalR |
| **Labs** | 在晋级前保持快速演进的能力 | AI/RAG/MCP、DataChannel、DevOps 与 Profiling、Office、Experimental |

Stable 不依赖 Labs。Integration 是可选能力，只有部署确实使用相应 Provider 时才应出现在组合根中。

## 采用方式

从能表达应用需求的最小 Stable 模块图开始；基础设施需要外部系统时再增加 Integration；主动采用 Labs 时，应接受其公开面在 1.0 内核之前可能更快变化。

框架仓库保存并验证官方成熟度清单，网站发布目录只镜像这份经过审阅的结果。

## 官方包与第三方包

以上层级只描述官方 `Monica.*` 包。独立发布者使用 `<Publisher>.Monica.<Package>` 生态命名，并对兼容性进行自我声明，不会自动获得官方成熟度等级。参阅[第三方包与品牌规范](../ecosystem/package-and-branding-standard.md)。
