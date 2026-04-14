---
title: 模块系统重构设计
description: Monica 新模块系统的重构入口、阅读顺序与设计范围。
sidebar_position: 6
---

# 模块系统重构设计

这一组文档面向 **Monica 框架维护者与核心模块作者**，讨论的是“如果允许整体重构并接受 breaking changes，模块系统应该如何重新设计”。

这里的目标不是在当前实现上继续打补丁，而是给出一套更清晰的目标模型，用来指导后续重构：

- 依赖声明阶段不再读取他模块配置
- 配置先统一冻结成只读快照，再允许跨模块读取
- 模块之间优先通过 `Contribution` 和 `Export` 协作，而不是互相改 `Option`
- 生命周期、配置可见性和错误边界由类型系统与上下文共同表达

## 适用范围

这组设计文档默认接受以下前提：

- 可以修改现有模块系统核心抽象
- 可以引入新的生命周期模型
- 可以迁移现有 `Guide`、`Option`、`ModuleRegistry` 和模块实现方式
- 不以兼容旧 API 为第一目标

## 推荐阅读顺序

1. [现状问题与重构目标](./current-problems-and-goals.md)
2. [目标架构与生命周期](./target-architecture.md)
3. [配置读取与 Contribution 模型](./configuration-reading-and-contributions.md)
4. [迁移策略与落地顺序](./migration-strategy.md)

## 这组文档回答什么问题

- 当前模块系统的核心设计债在哪里
- 新系统里哪些对象负责“描述模块”“构建配置”“提供运行时上下文”
- 模块间最合理的配置读取方式是什么
- 哪些跨模块协作应该改成 owner-owned contribution
- 如何把现有系统分阶段迁移到新模型

## 与现有概念页的关系

这不是普通用户文档，也不是模块使用说明。

如果你要先了解 Monica 当前对外模块形态，再看这组重构设计，建议先读：

- [Module 模式](../module-pattern.md)
- [Option 与 Guide](../configuration-and-guide.md)
- [Facade、Service、Provider 边界](../facades-services-providers.md)

## 输出目标

当这组设计最终落地时，理想结果应当是：

- 模块作者能从 API 层面知道“这个阶段能不能读别人的配置”
- 跨模块协作能优先使用强类型契约，而不是字符串 key 和全局状态
- 模块 owner 拥有自己的配置和聚合逻辑，外部模块只能读取只读快照或提交 contribution
- 模块系统的初始化、校验、去重和诊断路径都更可预测
