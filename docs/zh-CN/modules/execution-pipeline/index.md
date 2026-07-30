---
title: ExecutionPipeline
description: 为 Monica 执行边界提供有序类型化 Behavior，并展示运行时实际应用的执行计划。
sidebar_position: 1
---

# ExecutionPipeline

ExecutionPipeline 是 Monica 的共享执行内核。各子系统通过自己的 Adapter 把真实入口交给管线，宿主则注册类型化 Behavior，在不重复实现过滤器或代理的前提下统一授权、路由、事务、追踪与诊断。同一模块还公开只读运行时目录，用于检查已注册 Behavior，以及已经执行或被显式检查过的准确执行计划。

## 何时使用这个模块

- 你要为多个 Monica 执行入口增加同一类横切行为。
- 你在开发 Monica 模块，需要为新的执行入口提供原生 Adapter。
- 你希望按边界元数据选择 Behavior，而不是根据本次请求内容动态重建管线。
- 你需要确认某个操作实际应用了哪些 Behavior，以及它们的嵌套顺序。

一般应用不需要手工调用 `IExecutionPipeline`。Mediator、AutoControllers、EventBus、Seeder、HostedService 与 JobScheduler 都会通过自己的 Adapter 接入；应用只需注册额外 Behavior。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.Core` |
| 注册入口 | `monica.AddExecutionPipeline()` |
| 相关 UI 包 | `Monica.Framework.UI` |
| 相关 UI 注册入口 | `monica.AddExecutionPipelineUI()` |
| UI 路由 | `/execution-pipeline` |

## 公开使用面

- `IExecutionBehavior<TInput, TResult>`：定义类型化横切行为。
- `IExecutionPipeline`：通过适用的 Behavior 执行最终操作。
- `IExecutionPipelineCatalog`：读取当前宿主的注册目录，或显式检查一个描述符的执行计划。
- `ExecutionPipelineCatalogFacade`：通过 `GetSnapshotAsync()` 返回适合 UI 消费的 `Res<ExecutionPipelineCatalogSnapshot>`。
- `ExecutionDescriptor`：描述稳定、可缓存的执行边界。
- `ExecutionContext<TInput>`：保存本次调用输入、目标、取消令牌与特性。
- `ExecutionFeatureCollection`：保存 Adapter 提供的强类型调用元数据。
- `ExecutionPoint`、`ExecutionTransactionMode` 与 `ExecutionBehaviorOrder`：描述边界、事务策略与标准顺序带。

## 设计边界

ExecutionPipeline 不负责发现业务服务，不负责选择远程节点，也不会凭空创建事务。每个子系统仍拥有自己的调度、重试和错误协议；管线只负责把适用 Behavior 以确定顺序包在最终调用之外。

## 运行时目录语义

运行时目录把“已配置的意图”和“已经观察到的运行事实”分开：

- **注册项**始终包含当前宿主注册的全部 Behavior，并展示顺序、生命周期、开放泛型、过滤器和来源模块；来源模块为空表示由宿主直接注册。
- **执行计划**只在描述符实际执行过，或调用方显式调用 `IExecutionPipelineCatalog.InspectPlan(...)` 后出现。
- 已应用 Behavior 按**最外层到最内层**排列，与真实执行顺序完全一致。没有适用 Behavior 的计划仍是 Ready，但链为空。
- 描述符过滤器抛出的错误会作为 Faulted 计划保留；后续执行请求同一计划时会重新抛出该错误。

`GetSnapshot()` 和 `ExecutionPipelineCatalogFacade.GetSnapshotAsync()` 都是纯观察操作：不会解析 Behavior 实例、重新运行过滤器，也不会为从未出现过的操作猜测计划。目录只保存在当前宿主内存中，记录稳定类型和描述符元数据，不记录输入值、用户主体、目标实例或请求状态。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [统一执行边界](../../concepts/execution-boundaries.md)
