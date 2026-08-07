---
title: 统一执行边界
description: 理解 Monica 如何让不同项目单元共享授权、事务、追踪与诊断切面。
sidebar_position: 6
---

Monica 的统一执行管线把“某段代码从哪里进入系统”表达成明确的执行边界。Mediator 请求、MVC Action、事件处理器、Seeder、后台工作项和 Job 仍由各自模块负责调度，但可以通过同一套类型化 Behavior 承接授权、路由、UnitOfWork、追踪和性能诊断。

## 为什么需要统一边界

如果每种入口都各自实现一套过滤器、代理或装饰器，同一条规则会出现多份实现，并且很难保证执行顺序与失败语义一致。统一执行管线只统一横切行为的协议，不接管各模块原本的调度职责：

- Adapter 负责识别真实入口、构造稳定描述符，并调用最终业务代码。
- Behavior 负责围绕该入口增加可组合的横切行为。
- `ExecutionDescriptor` 描述可复用的边界元数据。
- `ExecutionContext<TInput>` 保存本次调用的输入、目标、取消令牌与特性。
- `ExecutionFeatureCollection` 保存 Adapter 提供的本次调用专属元数据。

## 内置执行边界

| 边界 | Execution point | Transaction mode | 说明 |
|---|---|---|---|
| Mediator 请求处理器 | `mediator.request` | `Automatic` | 每次 `IRequestHandler<TRequest, TResponse>` 调用。 |
| 直接 MVC Action | `webapi.mvc-action` | `Automatic` | 不经过 Mediator 的直接或生成式 MVC Action。 |
| 本地事件处理器 | `eventbus.local-handler` | `Automatic` | 单个本地事件投递。 |
| 分布式事件处理器 | `eventbus.distributed-handler` | `Automatic` | 单个分布式事件投递尝试。 |
| Seeder | `seeder.run` | `Automatic` | 单个有限范围的 Seeder 执行。 |
| Hosted work item | `hosted-service.work-item` | `Automatic` | 显式划分的后台工作项。 |
| Hosted service 启停 | `hosted-service.start` / `hosted-service.stop` | `None` | 生命周期编排，不自动创建外层事务。 |
| Recurring / Triggered Job | `jobs.recurring-attempt` / `jobs.triggered-attempt` | `None` | Job 尝试本身不拥有作业级事务。 |

`Automatic` 表示该边界允许已注册的自动事务 Behavior 参与，不表示单独注册 ExecutionPipeline 就会创建事务。只有宿主同时注册 UnitOfWork 等对应 Behavior 时，实际横切行为才会生效。`None` 也不会禁止业务代码显式创建小范围 UoW。

## Behavior 如何组合

Behavior 按数字顺序嵌套，数值越小越靠外。Monica 提供以下标准顺序带：

| 常量 | 值 | 典型用途 |
|---|---:|---|
| `ExecutionBehaviorOrder.Diagnostics` | `-3000` | 追踪、指标与完整执行观察。 |
| `ExecutionBehaviorOrder.Authorization` | `-2000` | 身份与授权检查。 |
| `ExecutionBehaviorOrder.Routing` | `-1000` | 路由或可能短路本地调用的远程执行。 |
| `ExecutionBehaviorOrder.UnitOfWork` | `0` | 本地应用工作的事务边界。 |
| `ExecutionBehaviorOrder.Application` | `1000` | 应用自定义 Behavior 的默认起点。 |

相同顺序只会按实现类型名获得可重复的排列，不能把这种排列当成业务语义。若两个 Behavior 有先后依赖，应分配不同顺序。

## 没有独立边界的普通服务

普通 ApplicationService、DomainService、Worker 或其他 DI 服务会在调用方已经建立的执行边界内运行。如果某个新子系统确实需要独立观察入口，应由该子系统提供类型化 Adapter，明确输入、目标、取消、结果、特性与事务语义。Monica 不会根据任意 DI 方法调用推断新的执行边界。

## 下一步

- [ExecutionPipeline 模块](../modules/execution-pipeline/index.md)
- [UnitOfWork 模块](../modules/unit-of-work/index.md)
