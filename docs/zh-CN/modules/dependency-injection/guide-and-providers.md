---
title: 注册与 Provider
description: DependencyInjection 的注册、Provider 选择与依赖说明。
sidebar_position: 4
---

## 模块注册

这个模块没有额外公开的模块专用注册扩展，通常直接调用 `monica.AddDependencyInjection()` 即可。它只负责约定注册、暴露规则与诊断，不提供方法拦截能力。

## Provider choices

| Choice | How to enable it | When to use it |
|---|---|---|
| 标记接口注册 | 实现 `ITransientDependency` / `IScopedDependency` / `ISingletonDependency` | 按生命周期做最直接的约定式注册。 |
| 显式暴露服务 | 使用 `ExposeServicesAttribute` / `ExposeKeyedServiceAttribute` | 你不想暴露实现类型本身，而只暴露接口或 keyed service 时。 |
| 运维 UI | `monica.AddDependencyInjectionUI()` | 需要查看自动注册快照与暴露服务结果时。 |

## Module dependencies

- 这是很多 Monica 模块和应用服务的基础设施模块之一。
- UI 诊断能力位于单独的 `monica.AddDependencyInjectionUI()`。
- 跨领域执行行为由各子系统原生 Adapter 接入 [Execution Pipeline](../execution-pipeline/index.md)，不属于本模块职责。
