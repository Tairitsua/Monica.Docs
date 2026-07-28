---
title: Scenarios
description: 使用约定注册与动态代理，同时明确处理服务激活约束。
sidebar_position: 5
---

# Scenarios

## 场景 1 — 用标记接口完成常规自动注册

在大多数业务模块里，直接通过生命周期标记接口声明注册意图即可。这样服务定义与注册规则保持在同一处，不需要反复回到宿主写 `services.AddScoped(...)`。

## 场景 2 — 需要更精细的暴露规则时使用注解

如果一个实现类型只应该通过某些接口或 keyed service 对外暴露，可以保留生命周期标记，再叠加 `ExposeServicesAttribute` 或 `ExposeKeyedServiceAttribute`。暴露的服务类型也会决定默认的动态代理类型：接口服务使用接口代理，具体服务类型使用类代理。

## 场景 3 — 使用类代理拦截具体服务

`AddInterceptor<TInterceptor>(...)` 会通过 `ProxyBuildContext` 检查每个服务注册。当谓词选中一个具体服务时，DynamicProxy 会创建继承自实现类型的 Castle 类代理。

因此，类代理目标必须满足两个条件：

- 实现类必须可继承，不能声明为 `sealed`；
- 每个需要被拦截的成员必须是 `virtual`、`abstract`，或者仍保持虚方法语义的 `override`。

这些要求只适用于被类代理拦截器选中的注册。如果普通约定注册服务或 EventBus 处理器没有应用类代理，它们仍然可以声明为 `sealed`。

如果选中的实现类是 `sealed`，Monica 会在组合 DynamicProxy 模块时拒绝该注册。诊断信息会指出服务类型、实现类型和可选修复方式，从而避免等到第一次解析服务时才出现 Castle `TypeLoadException`。

应根据实际语义选择修复方式：

1. 确实需要类拦截时，让实现类型可继承，并让需要拦截的成员保持虚方法语义。
2. 如果拦截语义属于接口契约，通过接口暴露服务并使用 `InterfaceProxy`。接口代理会包装目标对象，而不是继承实现类型。
3. 只有确认该服务不需要这个拦截器时，才收窄 `AddInterceptor` 谓词并排除该注册。

如果拦截器承担事务、授权或其他正确性职责，不要仅为了让服务启动而将其排除。

## Common mistakes

- 业务代码绕过 DI 自己 `new` 服务实例，导致 `ICachedServiceProvider` 等 Monica 约定无法初始化。
- 误以为任何类型都会被自动注册；实际上仍要通过 Monica 的标记接口或显式规则进入发现范围。
- 只把类改为可继承，却没有让需要拦截的方法保持虚方法语义。
- 使用不会组合 DynamicProxy 的原始单元 Fixture 验证代理相关行为。

代理行为应使用完整 Monica 测试宿主验证。参见[测试 Monica 应用](../../guides/testing-monica-applications.md)。
