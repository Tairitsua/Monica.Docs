---
title: Guide and Providers
description: DynamicProxy 的拦截器注册、代理类型与 ExecutionPipeline 兼容桥。
sidebar_position: 4
---

# Guide and Providers

## Guide methods

| Method | What it enables | Required | Typical use |
|---|---|---|---|
| `AddInterceptor<TInterceptor>(Func<ProxyBuildContext, bool>, string?)` | 为选中的服务注册自定义 `InvocationInterceptor` | 至少一种拦截能力需要 | 审计、兼容逻辑或服务方法级诊断。 |
| `SetProxyKindOfServiceType<TServiceType>(EDynamicProxyKind)` | 覆盖某个服务类型的默认代理方式 | 否 | 明确使用接口代理，或为具体类型选择类代理。 |
| `UseExecutionPipeline(Func<ProxyBuildContext, bool>)` | 把选定 `Task` / `Task<T>` 方法接入 ExecutionPipeline | 否 | 普通服务没有原生 Adapter，但需要统一 Behavior 时。 |

`AddInterceptor` 的 `secondKey` 是可选的稳定次级键。重复的模块配置应该折叠为同一项时传入稳定值；省略时，每次调用会生成独立键。

## Implementing an interceptor

自定义拦截器继承 `InvocationInterceptor` 并实现 `InterceptAsync(IMethodInvocation)`。`IMethodInvocation` 公开：

- `Arguments` 与 `ArgumentsDictionary`
- `GenericArguments`
- `TargetObject` 与 `Method`
- 可读写的 `ReturnValue`
- 继续目标方法的 `ProceedAsync()`

拦截器可以在调用前后执行逻辑，也可以选择不继续目标方法。若继续，通常应只调用一次 `ProceedAsync()`，并保留原始异常与取消语义。

## Proxy provider

当前模块使用 Castle DynamicProxy 和 Castle AsyncInterceptor，不暴露替换 Provider 的 Guide。两种代理方式的选择如下：

| Choice | How to enable it | When to use it |
|---|---|---|
| Interface proxy | 暴露接口服务，或调用 `SetProxyKindOfServiceType<TInterface>(InterfaceProxy)` | 希望包装目标对象、允许 sealed 实现，且拦截契约位于接口。 |
| Class proxy | 暴露具体服务，或为具体服务选择 `ClassProxy` | 必须拦截类的虚成员，且实现类型可继承。 |

## ExecutionPipeline compatibility bridge

```csharp
monica.AddDynamicProxy()
    .UseExecutionPipeline(
        static context => context.ServiceType == typeof(IOrderDomainService));
```

调用这个方法时，DynamicProxy 才会声明对 ExecutionPipeline 的模块依赖。桥是对缺少原生 Adapter 的服务模型的兼容手段，不应覆盖 Mediator Handler、EventBus Handler、Job、Hosted work item 等已有边界。

桥接方法在管线中使用：

| Item | Value |
|---|---|
| Execution point | `DynamicProxyExecutionPoints.Method` |
| Input | `DynamicProxyMethodInput` |
| Transaction mode | `ExecutionTransactionMode.Automatic` |
| Supported return shape | `Task`、`Task<T>` |

## Module dependencies

- 基础 DynamicProxy 功能位于 `Monica.DependencyInjection`，不要求应用注册 ExecutionPipeline。
- `UseExecutionPipeline(...)` 会按需注册 ExecutionPipeline 依赖。
- 原生执行 Adapter 不依赖 DynamicProxy。
