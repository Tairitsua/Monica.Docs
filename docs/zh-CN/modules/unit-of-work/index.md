---
title: UnitOfWork
description: 通过自动执行边界或显式业务粒度作用域协调仓储变更。
sidebar_position: 1
---

UnitOfWork 模块位于 `Monica.Repository`。它协调事务性 DbContext、提供 `IUnitOfWorkManager`，并在提交成功后运行回调。模块接入 Monica 统一 [Execution Pipeline](../execution-pipeline/index.md)，不再安装 MVC Action Filter。

## 自动边界与显式边界

`AddUnitOfWork()` 会为事务模式为 `Automatic` 的执行描述注册 `UnitOfWorkExecutionBehavior<,>`。Mediator 请求、直接 MVC Action、EventBus 处理器、Seeder 与有限 Hosted work item 使用该模式；嵌套自动边界会加入当前工作单元。

作业尝试和 Hosted Service 生命周期回调刻意使用 `ExecutionTransactionMode.None`。长时间运行或批量任务必须通过 `IUnitOfWorkManager.RunAsync(...)` 创建业务粒度的显式事务，不能让整个作业一直持有一个事务。

Repository DbContext 选择 `DbContextProviderType.UnitOfWork` 时，会自动引入本模块与自适应 DbContext Provider。只有没有 Repository 注册替你引入模块时，才需要直接调用 `monica.AddUnitOfWork()`。

## 公开使用面

- `IUnitOfWorkManager.RunAsync(...)`：围绕一次操作创建、完成、回滚并释放作用域。
- `IUnitOfWorkManager.BeginScope(...)`：需要多次 flush 或完成回调时进行手工控制。
- `UnitOfWorkScopeOptions`：控制事务、隔离级别、`RequiresNew` 与命令超时。
- `IUnitOfWork.OnCompleted(...)`：只在提交成功后运行后续工作。

活动工作单元中的 Repository `SaveChangesAsync()` 只会 flush，不会独立提交。操作异常会保留原始类型、实例与堆栈；如果回滚也失败，Monica 会把回滚异常附加到 `Exception.Data["Monica.Repository.UnitOfWork.RollbackException"]`，不会替换主异常。

## 相关页面

- [Quick Start](./quick-start.md)
- [Configuration](./configuration.md)
- [注册扩展与 Provider](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
