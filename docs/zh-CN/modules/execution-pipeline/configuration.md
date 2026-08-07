---
title: Configuration
description: 配置 ExecutionPipeline 的 Behavior 选择、目录元数据与可选运行时目录页面。
sidebar_position: 3
---

## Module options

`ModuleExecutionPipelineOption` 当前没有面向应用的标量配置项。Behavior 目录由 `ModuleExecutionPipelineGuide.AddBehavior(...)` 维护，不应直接修改模块选项。

可选的 `ModuleExecutionPipelineUIOption` 只有一个设置：

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `DisablePage` | `bool` | `false` | 否 | 组合式 UI 包需要排除内置页面时设为 `true`。 | 跳过页面状态、路由、导航入口和 UI 依赖；不会禁用独立注册的 Core 执行管线。 |

## Descriptor contract

`ExecutionDescriptor` 是可复用且会被记忆化的边界定义。以下属性可用于 `descriptorFilter`：

| Property | Type | 说明 |
|---|---|---|
| `Point` | `ExecutionPoint` | 子系统发布的稳定、区分大小写的执行点。 |
| `DisplayName` | `string` | 用于诊断的稳定可读操作名。 |
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

## Catalog state

目录公开不可变快照，而不是实时 DI 对象：

| Type | 含义 |
|---|---|
| `ExecutionBehaviorRegistrationSnapshot` | 一个已配置 Behavior 的类型、顺序、生命周期、来源模块、泛型与过滤器信息。 |
| `ExecutionDescriptorSnapshot` | 用于选择执行计划的稳定操作元数据。 |
| `ExecutionPipelineAppliedBehaviorSnapshot` | 一个已解析 Behavior，以及从外到内的一位起始位置。 |
| `ExecutionPipelinePlanSnapshot` | 一个已观察或显式检查的计划，包含描述符、状态、时间、应用链和可选错误。 |
| `ExecutionPipelineCatalogSnapshot` | 当前时间点的全部注册项和已观察计划。 |

计划状态有三个值：

| Status | 含义 |
|---|---|
| `Building` | 正在计算描述符过滤器和泛型契约。 |
| `Ready` | 不可变应用链已经可用；链可以合法地为空。 |
| `Faulted` | 计划物化失败，确定性错误会保留到宿主结束。 |

诊断使用 `PlanKey` 标识一个计划。它不仅包含操作身份，还包含可能影响描述符过滤器的业务操作和事务策略。存在策略差异时，不要只按 `OperationKey` 聚合计划。
