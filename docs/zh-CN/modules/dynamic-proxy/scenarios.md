---
title: Scenarios
description: 在接口代理、类代理与 ExecutionPipeline 兼容桥之间做出明确选择。
sidebar_position: 5
---

# Scenarios

## 场景 1 — 拦截 sealed 实现的接口契约

当服务通过接口暴露时，默认接口代理包装目标对象，不需要继承实现类。因此 sealed 实现可以安全参与：

```csharp
builder.Services.AddScoped<IOrderService, OrderService>();

builder.AddMonica(monica =>
{
    monica.AddDynamicProxy()
        .AddInterceptor<AuditInvocationInterceptor>(
            static context => context.ServiceType == typeof(IOrderService));
});
```

这通常比仅为代理解除 `sealed` 并把方法改成 `virtual` 更清晰。

## 场景 2 — 拦截具体类型的虚成员

如果服务必须通过具体类型暴露，类代理要求实现可继承，且待拦截成员具有虚方法语义：

```csharp
public class PricingService
{
    public virtual Task<decimal> CalculateAsync(
        Order order,
        CancellationToken cancellationToken)
    {
        return Task.FromResult(0m); // Replace with the real calculation.
    }
}
```

非虚方法不会被类代理拦截。若拦截器承担授权、事务等正确性职责，不要通过缩小谓词来掩盖不满足代理条件的服务；应选择合适的接口契约或原生 Adapter。

## 场景 3 — 为普通异步 DomainService 桥接 ExecutionPipeline

只有在服务没有原生 Adapter 时才使用窄桥：

```csharp
builder.AddMonica(monica =>
{
    monica.AddDynamicProxy()
        .UseExecutionPipeline(
            static context =>
                context.ServiceType == typeof(IOrderDomainService));
});
```

被选中的 `Task` / `Task<T>` 方法会进入 `dynamic-proxy.method` 边界；同步方法和 `ValueTask` 仍直接执行。该服务必须是 Scoped 或 Transient。

如果某个调用已经通过 Mediator、MVC、EventBus、Seeder、Hosted work item 或 Job Adapter 进入管线，不要在同一契约上再加桥。Monica 会排除其已知的 Adapter-owned 契约，但应用自己的重复包装仍应从设计上避免。

## 场景 4 — 诊断有状态类代理

当 Factory / Instance 注册的具体服务拥有可变字段，而且必须使用 class-proxy-with-target 时，可以临时启用：

```csharp
monica.AddDynamicProxy(options =>
{
    options.EnableClassProxyTargetStateWarning = true;
});
```

根据告警检查代理对象与目标对象是否可能维护不同状态。完成定位后，优先改为接口代理或无状态服务设计，而不是长期依赖告警。

## Common mistakes

- 认为 Monica.Core、ProjectUnit 或 ExecutionPipeline 默认依赖 DynamicProxy。
- 对普通 DI 服务调用 `new`，绕过已注册的代理。
- 用类代理拦截 sealed 实现或非虚方法。
- 为 Singleton 服务启用 `UseExecutionPipeline(...)`；模块会在组合期拒绝。
- 期待 ExecutionPipeline 桥处理同步方法或 `ValueTask`。
- 用请求级状态编写 `ProxyBuildContext` 谓词；该谓词在服务组合阶段运行。
- 在已有原生 Adapter 的入口外再套一层桥，造成横切行为重复。
