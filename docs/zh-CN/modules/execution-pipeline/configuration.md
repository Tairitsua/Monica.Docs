---
title: Configuration
description: ExecutionPipeline 的模块选项、描述符与 Behavior 选择规则。
sidebar_position: 3
---

# Configuration

## Module options

`ModuleExecutionPipelineOption` 当前没有面向应用的标量配置项。Behavior 目录由 `ModuleExecutionPipelineGuide.AddBehavior(...)` 维护，不应直接修改模块选项。

## Descriptor contract

`ExecutionDescriptor` 是可复用且会被记忆化的边界定义。以下属性可用于 `descriptorFilter`：

| Property | Type | 说明 |
|---|---|---|
| `Point` | `ExecutionPoint` | 子系统发布的稳定、区分大小写的执行点。 |
| `OperationName` | `string` | 用于诊断的稳定操作名。 |
| `ComponentType` | `Type` | 被调用的具体类型或契约类型。 |
| `EntryMethod` | `MethodInfo?` | Adapter 能识别时的具体入口方法。 |
| `InputType` | `Type` | 管线输入类型。 |
| `ResultType` | `Type` | 管线结果类型。 |
| `IsBusinessOperation` | `bool` | 是否表示应用业务工作。 |
| `TransactionMode` | `ExecutionTransactionMode` | 是否允许自动事务 Behavior 包裹该边界。 |

描述符不保存请求参数、用户、租户或本次调用状态。`descriptorFilter` 在执行计划首次缓存时求值，因此只能依赖这些稳定元数据。调用级数据应通过 `ExecutionContext<TInput>` 或强类型 Feature 读取。

## Transaction modes

| Value | 含义 |
|---|---|
| `ExecutionTransactionMode.Automatic` | 允许已注册的 UnitOfWork Behavior 为整个边界创建自动外层 UoW。 |
| `ExecutionTransactionMode.None` | 不创建自动外层 UoW；业务代码仍可显式创建适合自身批次的 UoW。 |

`None` 不会清除已经存在的 ambient UnitOfWork。在现有 ambient scope 内调用的代码仍会观察到它，除非显式创建 `RequiresNew` 作用域。

Job 尝试和 HostedService 启停使用 `None`，避免长时间运行或大批量流程被一个作业级事务包裹。需要写库的 Job 应在业务代码中划分明确、有限的事务范围。

## Invocation context

Behavior 从 `ExecutionContext<TInput>` 读取本次调用状态：

- `Input`：当前输入。
- `Target`：Adapter 能提供时的目标实例。
- `CancellationToken`：当前边界的取消令牌。
- `Features`：Adapter 专属的强类型元数据集合。

Feature 按注册时的精确泛型类型查找，不会自动按其接口返回。未使用 Feature 时，集合保持延迟创建。集合只属于一次调用且不是线程安全的，不要并发修改同一个 `ExecutionFeatureCollection`。

## Registration constraints

- 同一宿主中，同一个 Behavior 实现类型只能注册一次。
- `AddBehavior(...)` 拥有该 Behavior 的 DI 注册；不要再用 `builder.Services` 重复注册同一实现类型。
- 默认生命周期是 `Transient`；也可以显式选择 `Scoped` 或 `Singleton`。
- `Scoped` Behavior 会从与 `IExecutionPipeline` 相同的作用域解析。
- 相同 `order` 的 Behavior 必须语义独立；若相对嵌套顺序有意义，应使用不同数值。
