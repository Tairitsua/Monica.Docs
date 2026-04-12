---
title: Facade、Service、Provider 边界
description: 理解 Monica 对外入口与内部实现边界。
sidebar_position: 3
---

# Facade、Service、Provider 边界

Monica 的模块文档应该优先描述**公开边界**，而不是内部实现细节。理解下面这条线非常重要：

```text
Host / UI / API → Facade → Service → Provider
```

## Facade

Facade 是主机或 UI 面向模块的**公开用例入口**。在 Monica 里：

- Facade 是对外契约的一部分
- Facade 常返回 `Res` / `Res<T>`
- UI 模块和宿主代码直接依赖 Facade 很正常

## Service

Service 是模块内部实现层：

- 负责真正的业务流程与编排
- 通常不是跨模块公开契约
- 内部错误更偏向用标准 .NET 返回值和异常表达

## Provider

Provider 负责“替换型基础设施实现”，例如：

- 数据库存储
- 向量库
- 外部系统 SDK
- 文件 / 状态存储 / 消息基础设施

文档里可以说明“有哪些 Provider 选择”，但不要把内部 Provider 当成稳定的外部 API 去承诺。

## 为什么这会影响文档写法

写模块文档时应该优先回答：

- 用户应该注册哪个模块入口？
- 用户应该配置哪些 Option / Guide？
- 用户可直接依赖哪些 Facade / Abstraction / Model？
- 用户什么时候需要选择 Provider？

而不是先讲内部 Service 如何实现。
