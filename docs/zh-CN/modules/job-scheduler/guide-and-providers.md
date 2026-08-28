---
title: 注册与提供程序
description: JobScheduler 的注册扩展、存储选择与依赖说明。
sidebar_position: 5
---

## 注册扩展

| 方法 | 启用什么 | 必需 | 典型用途 |
|---|---|---|---|
| `UseStore<TStore>()` | 注册自定义统一调度存储 | 是（三选一） | 你有自己的持久化实现，满足 `IJobSchedulerStore` 的原子性契约。 |
| `UseInMemoryStore()` | 进程内存储 | 是（三选一） | 本地开发、演示与确定性测试；不跨越重启，无法协调多宿主。 |
| `UseEfCoreStore(optionsAction, moduleAction?)` | 用一个 EF Core 数据库作为定义、策略、队列、租约与历史的正确性边界 | 是（三选一） | 真实部署；由 `Monica.JobScheduler.EfCore` 提供。 |
| `UseSchedulerScope(scopeKey)` | 设置调度命名空间 | 是 | 一个环境内所有宿主共享的稳定键。 |

没有默认存储：模块声明了必需的存储特性，未调用任一存储扩展时模块校验会直接失败。

## EF Core 持久化

安装 `Monica.JobScheduler.EfCore` 后：

```csharp
monica.AddJobScheduler()
    .UseEfCoreStore((sp, optionsBuilder) =>
    {
        optionsBuilder.UseNpgsql(builder.Configuration.GetConnectionString("JobScheduler")!);
    })
    .UseSchedulerScope(builder.Environment.IsDevelopment() ? "orders-debug" : "orders");
```

所选数据库必须被同作用域的所有宿主共享；生产部署应使用 PostgreSQL 兼容的可串行化事务。任何能提供可串行化事务的存储（包括通过 PostgreSQL 兼容 EF provider 接入的 openGauss/GaussDB）都可以复用同一注册形态。

## 模块依赖

- 模块要求 HostedService 能力与 Health Check 能力（健康检查 `monica.job-scheduler`，标签 `scheduler`）。
- 契约要求容器中存在 `IJobSchedulerStore`，由存储选择扩展满足。
- 每个宿主都注册 `JobSchedulerFacade` 与 `ITriggeredJobManager`；每个宿主只调度并执行自己所有者的作业。
- 运维工作台加 `monica.AddJobSchedulerUI()`；运行时页的实例洞察加 `monica.AddJobSchedulerServiceDiscoveryInsight()`。

## 执行归属

JobScheduler 适配器创建 `jobs.recurring-attempt` 与 `jobs.triggered-attempt` 执行描述符。两者都是业务操作，但事务模式均为 `None`。诊断等执行行为仍然生效；`UnitOfWorkExecutionBehavior<,>` 不生效。

这一拆分是有意为之：调度器拥有尝试、重试、取消与历史；作业实现拥有数据库事务的大小。写批次请使用显式 [UnitOfWork](../unit-of-work/index.md) 作用域。
