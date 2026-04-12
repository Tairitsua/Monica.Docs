---
title: Guide and Providers
description: DependencyInjection 的 Guide 方法、Provider 选择与依赖说明。
sidebar_position: 4
---

# Guide and Providers

## Guide methods

这个模块没有额外公开的 Guide 方法，通常直接通过 `Mo.AddDependencyInjection()` 进入即可。

## Provider choices

| Choice | How to enable it | When to use it |
|---|---|---|
| 标记接口注册 | 实现 `ITransientDependency` / `IScopedDependency` / `ISingletonDependency` | 按生命周期做最直接的约定式注册。 |
| 显式暴露服务 | 使用 `ExposeServicesAttribute` / `ExposeKeyedServiceAttribute` | 你不想暴露实现类型本身，而只暴露接口或 keyed service 时。 |
| 运维 UI | `Mo.AddDependencyInjectionUI()` | 需要查看自动注册快照与暴露服务结果时。 |

## Module dependencies

- 这是很多 Monica 模块和应用服务的基础设施模块之一。
- UI 诊断能力位于单独的 `Mo.AddDependencyInjectionUI()`。
