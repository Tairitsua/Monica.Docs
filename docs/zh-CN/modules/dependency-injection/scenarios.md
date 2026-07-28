---
title: Scenarios
description: 使用约定注册，同时让服务生命周期和暴露规则保持明确。
sidebar_position: 5
---

# Scenarios

## 场景 1 — 用标记接口完成常规自动注册

在大多数业务模块里，直接通过生命周期标记接口声明注册意图即可。这样服务定义与注册规则保持在同一处，不需要反复回到宿主写 `services.AddScoped(...)`。

## 场景 2 — 需要更精细的暴露规则时使用注解

如果一个实现类型只应该通过某些接口或 keyed service 对外暴露，可以保留生命周期标记，再叠加 `ExposeServicesAttribute` 或 `ExposeKeyedServiceAttribute`。

## 场景 3 — 把方法拦截作为独立决策

约定注册与方法拦截解决不同问题。先在本模块完成服务注册；只有选定的应用服务确实需要方法级拦截，且没有子系统适配器拥有该执行边界时，才另外组合 [DynamicProxy 模块](../dynamic-proxy/index.md)。Monica 内置的授权、UnitOfWork、EventBus、Mediator、MVC 与作业行为都使用统一 [Execution Pipeline](../execution-pipeline/index.md)，无需 DynamicProxy。

## Common mistakes

- 业务代码绕过 DI 自己 `new` 服务实例，导致 `ICachedServiceProvider` 等 Monica 约定无法初始化。
- 误以为任何类型都会被自动注册；实际上仍要通过 Monica 的标记接口或显式规则进入发现范围。
- 误以为 `AddDependencyInjection()` 会同时启用 DynamicProxy。
- 使用不会组合生产模块图的原始单元 Fixture 验证注册相关行为。

组合行为应使用完整 Monica 测试宿主验证。参见[测试 Monica 应用](../../guides/testing-monica-applications.md)。
