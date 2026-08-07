---
title: Configuration
description: 配置实体事件与显式工作单元作用域语义。
sidebar_position: 3
---

## Module option

| 属性 | 类型 | 默认值 | 何时修改 |
|---|---|---:|---|
| `EnableEntityEvent` | `bool` | `false` | 只有实体变化事件属于应用明确的领域契约时才启用。 |

## 作用域选项

`UnitOfWorkScopeOptions` 属于每个显式作用域：

| 参数 | 默认值 | 含义 |
|---|---:|---|
| `IsTransactional` | `true` | 为参与的 DbContext 启动事务。 |
| `IsolationLevel` | `null` | 未设置时使用数据库 Provider 默认值。 |
| `RequiresNew` | `false` | 默认加入 ambient scope；`true` 创建独立外层作用域。 |
| `Timeout` | `null` | 可选的关系型数据库命令超时，单位为毫秒。 |

```csharp
await unitOfWorkManager.RunAsync(
    ExecuteBatchAsync,
    new UnitOfWorkScopeOptions(
        RequiresNew: true,
        Timeout: 30_000),
    cancellationToken);
```

只有内部操作必须独立于 ambient transaction 提交或回滚时，才使用 `RequiresNew`。
