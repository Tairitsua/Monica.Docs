---
title: Scenarios
description: 使用约定注册，同时让服务生命周期和暴露规则保持明确。
sidebar_position: 5
---

## 场景 1 — 用标记接口完成常规自动注册

在大多数业务模块里，直接通过生命周期标记接口声明注册意图即可。这样服务定义与注册规则保持在同一处，不需要反复回到宿主写 `services.AddScoped(...)`。

## 场景 2 — 需要更精细的暴露规则时使用注解

如果一个实现类型只应该通过某些接口或 keyed service 对外暴露，可以保留生命周期标记，再叠加 `ExposeServicesAttribute` 或 `ExposeKeyedServiceAttribute`。

## 场景 3 — 保持由容器统一激活

应通过 Monica DI 解析约定注册的实现，不要直接构造。当子系统需要通过额外契约暴露同一个实现时，该契约应解析到规范的具体类型注册，而不是建立第二条激活路径。这样才能保留生命周期、替换规则、keyed 暴露以及 `ICachedServiceProvider` 初始化。

授权、UnitOfWork、EventBus、Mediator、MVC 与作业行为由子系统原生 Adapter 接入共享 [Execution Pipeline](../execution-pipeline/index.md)。约定注册不应为了应用这些行为而承担方法拦截职责。

## Common mistakes

- 业务代码绕过 DI 自己 `new` 服务实例，导致 `ICachedServiceProvider` 等 Monica 约定无法初始化。
- 误以为任何类型都会被自动注册；实际上仍要通过 Monica 的标记接口或显式规则进入发现范围。
- 通过多个契约独立注册同一个实现，无意中建立多条激活路径。
- 使用不会组合生产模块图的原始单元 Fixture 验证注册相关行为。

组合行为应使用完整 Monica 测试宿主验证。参见[测试 Monica 应用](../../guides/testing-monica-applications.md)。
