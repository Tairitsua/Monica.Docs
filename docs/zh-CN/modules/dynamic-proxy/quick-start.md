---
title: Quick Start
description: 注册 DynamicProxy 并为一个接口服务添加自定义拦截器。
sidebar_position: 2
---

# Quick Start

## 安装包

```bash
dotnet add package Monica.DependencyInjection --prerelease
```

## 定义拦截器

拦截器可以读取参数、方法与目标对象，并通过 `ProceedAsync()` 继续调用。正常的环绕拦截器应保留原异常与取消语义。

```csharp
using Microsoft.Extensions.Logging;
using Monica.DependencyInjection.DynamicProxy.Abstractions;

public sealed class AuditInvocationInterceptor(
    ILogger<AuditInvocationInterceptor> logger)
    : InvocationInterceptor
{
    public override async Task InterceptAsync(IMethodInvocation invocation)
    {
        logger.LogInformation(
            "Calling {ServiceType}.{MethodName}",
            invocation.TargetObject.GetType().Name,
            invocation.Method.Name);

        await invocation.ProceedAsync();
    }
}
```

## 注册服务与 DynamicProxy

下面的谓词只选择通过 `IOrderService` 暴露的服务注册。接口服务默认使用接口代理，因此实现类可以保持 `sealed`。

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<IOrderService, OrderService>();

builder.AddMonica(monica =>
{
    monica.AddDynamicProxy()
        .AddInterceptor<AuditInvocationInterceptor>(
            static context => context.ServiceType == typeof(IOrderService));
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

只有从 DI 解析出的代理实例会执行拦截器。业务代码自己 `new OrderService()` 会绕过代理。

## 接下来读什么

- [Configuration](./configuration.md) 说明默认代理类型与类代理限制。
- [Guide and Providers](./guide-and-providers.md) 说明三个 Guide 方法。
- [Scenarios](./scenarios.md) 展示接口代理、类代理与 ExecutionPipeline 桥。
