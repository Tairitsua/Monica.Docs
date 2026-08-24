---
title: 注册扩展与角色
description: JobScheduler 的注册扩展、角色选择与依赖说明。
sidebar_position: 5
---

## 注册扩展

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `UseStore<TStore>()` | 注册自定义统一存储 | 是（三选一） | 你有自己的持久化实现，且满足 `IJobSchedulerStore` 的原子性契约时。 |
| `UseInMemoryStore()` | 使用进程内存储 | 是（三选一） | 本地开发、Demo 与确定性测试；不跨重启、不能协调多宿主。 |
| `UseEfCoreStore(optionsAction, moduleAction?)` | 使用 EF Core 数据库作为目录、策略、队列、租约与历史的正确性边界 | 是（三选一） | 真实部署；来自 `Monica.JobScheduler.EfCore`。 |
| `UseSchedulerScope(string scopeKey)` | 设置调度作用域 | 是 | 同一环境的所有控制面与 worker 宿主共用一个稳定键。 |
| `UseCatalogRelease(releaseId, generation, owners)` | 声明一次不可变目录发布 | 是 | 每次部署发布变化时更新；所有参与宿主必须字节一致。 |
| `AsControlPlane()` / `AsWorker()` / `AsStandalone()` | 选择宿主角色 | 否 | 默认 `Worker`；单机开发用 `AsStandalone()`。 |
| `UseLocalWorkerIdentity(ownerId, workerRevisionId)` | 覆盖本地 worker 身份 | 否 | 部署归属与项目身份刻意不同时。 |

## Role choices

| Role | How to enable | What this host does |
|---|---|---|
| ControlPlane | `AsControlPlane()` | 暂存与激活目录发布、物化重复出现、回收过期租约；**不能携带可执行作业类型**。 |
| Worker | 默认（`AsWorker()`） | 发布一个 owner 目录快照，只认领与自身版本精确匹配的执行；不物化重复计划。 |
| Standalone | `AsStandalone()` | 单进程同时承担控制面与工作面，适合本地开发与最小部署。 |

## EF Core 持久化

安装 `Monica.JobScheduler.EfCore` 后：

```csharp
monica.AddJobScheduler()
    .UseEfCoreStore((sp, optionsBuilder) =>
    {
        optionsBuilder.UseNpgsql(builder.Configuration.GetConnectionString("JobScheduler")!);
    })
    .UseSchedulerScope(builder.Environment.IsDevelopment() ? "orders-debug" : "orders")
    .UseCatalogRelease("orders:2026.8", deploymentGeneration: 12, owners)
    .AsStandalone();
```

选择的数据库必须被同一作用域内的所有控制面与 worker 副本共享；生产部署建议使用支持可序列化事务的 PostgreSQL 兼容数据库。

## Module dependencies

- 模块依赖 HostedService 能力与 Health Check 能力（健康检查名 `monica.job-scheduler`，tag `scheduler`）。
- 模块契约要求容器中存在 `IJobSchedulerStore`，由存储选择扩展满足。
- 控制面宿主额外注册 `JobSchedulerFacade`；worker 与 standalone 宿主注册 `ITriggeredJobManager` 与执行服务。
- 如果需要可视化控制面，额外接入 `monica.AddJobSchedulerUI()`。

## 执行与事务所有权

JobScheduler 会创建 `jobs.recurring-attempt` 和 `jobs.triggered-attempt` 执行描述。两者都是业务操作，但事务模式都是 `None`。诊断等执行行为仍可运行，`UnitOfWorkExecutionBehavior<,>` 不会自动包裹整个作业。

这种拆分是有意的：调度器负责尝试、重试、取消和历史，作业实现负责数据库事务大小。写入批次应显式使用 [UnitOfWork](../unit-of-work/index.md)。
