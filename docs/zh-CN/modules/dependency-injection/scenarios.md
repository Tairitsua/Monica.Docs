---
title: Scenarios
description: DependencyInjection 的常见接入方式与使用陷阱。
sidebar_position: 5
---

# Scenarios

## 场景 1 — 用标记接口完成常规自动注册

在大多数业务模块里，直接通过生命周期标记接口声明注册意图即可。这样服务定义与注册规则保持在同一处，不需要反复回到宿主写 `services.AddScoped(...)`。

## 场景 2 — 需要更精细的暴露规则时使用注解

如果一个实现类型只应该通过某些接口对外暴露，或者需要 keyed service，你可以保留生命周期标记，再叠加 `ExposeServicesAttribute` / `ExposeKeyedServiceAttribute` 来限定公开契约。

## Common mistakes

- 业务代码绕过 DI 自己 `new` 服务实例，导致 `ICachedServiceProvider` 等 Monica 约定无法初始化。
- 误以为任何类型都会被自动注册；实际上仍要通过 Monica 的标记接口或显式规则进入发现范围。
