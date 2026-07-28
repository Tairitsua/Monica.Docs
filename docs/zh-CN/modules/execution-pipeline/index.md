---
title: ExecutionPipeline
description: 为 Mediator、MVC、事件、Seeder、后台工作项和 Job 提供统一的类型化执行行为。
sidebar_position: 1
---

# ExecutionPipeline

ExecutionPipeline 是 Monica 的共享执行内核。各子系统通过自己的 Adapter 把真实入口交给管线，宿主则注册类型化 Behavior，在不重复实现过滤器或代理的前提下统一授权、路由、事务、追踪与诊断。

## 何时使用这个模块

- 你要为多个 Monica 执行入口增加同一类横切行为。
- 你在开发 Monica 模块，需要为新的执行入口提供原生 Adapter。
- 你希望按边界元数据选择 Behavior，而不是根据本次请求内容动态重建管线。

一般应用不需要手工调用 `IExecutionPipeline`。Mediator、AutoControllers、EventBus、Seeder、HostedService 与 JobScheduler 都会通过自己的 Adapter 接入；应用只需注册额外 Behavior。

## 包与注册入口

| 项目 | 值 |
|---|---|
| 包 | `Monica.Core` |
| 注册入口 | `monica.AddExecutionPipeline()` |
| 相关 UI 模块 | 无 |
| 可选桥接模块 | `monica.AddDynamicProxy()`，位于 `Monica.DependencyInjection` |

## 公开使用面

- `IExecutionBehavior<TInput, TResult>`：定义类型化横切行为。
- `IExecutionPipeline`：通过适用的 Behavior 执行最终操作。
- `ExecutionDescriptor`：描述稳定、可缓存的执行边界。
- `ExecutionContext<TInput>`：保存本次调用输入、目标、取消令牌与特性。
- `ExecutionFeatureCollection`：保存 Adapter 提供的强类型调用元数据。
- `ExecutionPoint`、`ExecutionTransactionMode` 与 `ExecutionBehaviorOrder`：描述边界、事务策略与标准顺序带。

## 设计边界

ExecutionPipeline 不负责发现业务服务，不负责选择远程节点，也不会凭空创建事务。每个子系统仍拥有自己的调度、重试和错误协议；管线只负责把适用 Behavior 以确定顺序包在最终调用之外。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [Guide and Providers](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
- [统一执行边界](../../concepts/execution-boundaries.md)
- [DynamicProxy](../dynamic-proxy/index.md)
