---
title: 核心概念
description: 理解 Monica 的主机绑定组合、项目单元、注册扩展、公开边界和结果模型。
sidebar_position: 2
---

Monica 用一套同时面向开发者、编码 Agent 与运行时的明确契约组织应用。先理解主机绑定的模块图和 ProjectUnits，再进入具体模块，会比逐个记忆注册方法更可靠。

## 推荐顺序

1. [Module 模式与主机边界](./module-pattern.md)
2. [Option 与注册扩展](./configuration-and-guide.md)
3. [Facade、Service、Provider 边界](./facades-services-providers.md)
4. [统一结果模型 Res](./result-envelope.md)
5. [项目单元编写](./project-unit-authoring.md)
6. [执行边界](./execution-boundaries.md)

模块系统概念页描述已经落地的冻结图、关系校验 Option 读取、集中式类型发现与不可变诊断契约，不再发布重构前的提案 API。
