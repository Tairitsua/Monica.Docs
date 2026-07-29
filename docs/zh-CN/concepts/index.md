---
title: 核心概念
description: 理解 Monica 的主机绑定组合、项目单元、Guide、公开边界和结果模型。
sidebar_position: 2
---

# 核心概念

Monica 用一套同时面向开发者、编码 Agent 与运行时的明确契约组织应用。先理解主机绑定的模块图和 ProjectUnits，再进入具体模块，会比逐个记忆注册方法更可靠。

## 推荐顺序

1. [Module 模式与主机边界](./module-pattern.md)
2. [Option 与 Guide](./configuration-and-guide.md)
3. [Facade、Service、Provider 边界](./facades-services-providers.md)
4. [统一结果模型 Res](./result-envelope.md)
5. [项目单元编写](./project-unit-authoring.md)
6. [执行边界](./execution-boundaries.md)

`module-system-refactor/` 保存的是设计演进资料，不应作为当前公开 API 的使用指南。当前用法以本页、模块文档和源码为准。
