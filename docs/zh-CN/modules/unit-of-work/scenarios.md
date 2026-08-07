---
title: Scenarios
description: 选择自动、独立和有界的事务作用域。
sidebar_position: 5
---

## 场景 1 — 让普通应用入口自动加入工作单元

Mediator 请求、直接 MVC Action、EventBus 处理器、Seeder 与有限 Hosted work item 使用自动执行描述。注册 UnitOfWork 后，其中的仓储操作会共享一个 ambient scope；嵌套自动边界会加入现有工作单元，不会创建冗余事务。

## 场景 2 — 为作业划分业务粒度事务

JobScheduler Adapter 刻意不创建自动作业级外层 UnitOfWork。扫描或批处理应拆成有界批次，并为每个写入单元调用 `RunAsync(...)`：

```csharp
foreach (var batch in batches)
{
    await unitOfWorkManager.RunAsync(
        () => PersistBatchAsync(batch, cancellationToken),
        cancellationToken: cancellationToken);
}
```

这样可以限制锁持有时间和回滚范围。外部消息应在数据库工作提交后再发布。

## 场景 3 — 让嵌套工作脱离 ambient scope

没有 ambient UnitOfWork 时，每次 `RunAsync(...)` 本身就会创建独立作用域。只有当前已经存在 ambient scope，且嵌套工作必须独立提交或回滚时，才使用 `RequiresNew: true`：

```csharp
await unitOfWorkManager.RunAsync(
    RebuildOneCategoryAsync,
    new UnitOfWorkScopeOptions(RequiresNew: true),
    cancellationToken);
```

## 场景 4 — 提交成功后再发布

需要手工控制时，注册异步完成回调：

```csharp
await using var unitOfWork = unitOfWorkManager.BeginScope();
await repository.InsertAsync(order, cancellationToken);
unitOfWork.OnCompleted(
    () => localEventBus.PublishAsync(new OrderApproved(order.Id)));
await unitOfWork.CompleteAsync(cancellationToken);
```

## 失败语义

`RunAsync(...)` 使用 `CancellationToken.None` 执行回滚，随后重新抛出原始操作或完成异常。如果回滚失败，该异常会附加到原异常 `Data` 字典的 `Monica.Repository.UnitOfWork.RollbackException` 项。

## Common mistakes

- 在整个长作业或无界扫描外创建一个事务。
- 没有 ambient scope 时仍添加 `RequiresNew`，或在 ambient transaction 中使用它却没有明确的部分提交策略。
- 打开手工作用域后忘记调用 `CompleteAsync()`。
- 数据库提交成功前发布不可逆的外部工作。
