---
title: Scenarios
description: UnitOfWork 的常见接入方式与使用陷阱。
sidebar_position: 5
---

# Scenarios

## 场景 1 — 在应用服务或后台流程里手工创建事务性 UoW

对于不走标准 MVC 请求入口的场景，例如后台执行流、跨仓储业务编排或复杂批处理，直接注入 `IUnitOfWorkManager` 并手工 `Begin(...)` 是最清晰的做法。

## 场景 2 — 让 MVC 入口自动承接 UoW

模块已经把 `UnitOfWorkActionFilter` 加入 MVC 过滤器链。如果你的请求入口是 Controller，并且对应仓储使用了 UoW Provider，那么它们就能在同一工作单元上下文中协作。

## Common mistakes

- 在事务性场景里创建了 UoW 却忘记 `CompleteAsync()`。
- 仓储使用了 UoW Provider，但代码实际运行时没有活动工作单元。
