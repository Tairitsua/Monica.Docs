---
title: Module 模式
description: 理解 Monica 模块的注册入口、Option、Guide 和公开契约。
sidebar_position: 1
---

# Module 模式

Monica 的每个模块都尽量遵循同一套对外形态：**`Mo.Add*()` + `ModuleOption` + `ModuleGuide` + 公开契约类型**。

## 你会看到的公开部件

一个典型 Monica 模块通常包含：

- `Mo.Add{Name}()`：用户入口
- `Module{Name}Option`：公开配置项
- `Module{Name}Guide`：链式启用附加能力
- 公开 `Abstractions/`、`Models/`、`Facades/`、`Events/`、`Exceptions/` 等契约类型

## 统一注册方式

```csharp
Mo.AddConfiguration()
    .ConfigCustomStore<MyHistoryStore>();
```

在这个例子里：

- `Mo.AddConfiguration()` 负责基础注册；常规宿主会自动使用 `builder.Configuration`
- `.ConfigCustomStore<MyHistoryStore>()` 是 Guide 提供的附加配置动作

## 为什么 Monica 要这样设计

这套模式把“启用模块”和“选择模块行为”分成两层：

- **Option** 负责公开、稳定、可枚举的配置项
- **Guide** 负责更像“启用能力”或“选择实现”的动作

这样文档和代码都更容易形成统一习惯。

## 文档应该优先描述什么

从用户视角看，一个模块最重要的顺序通常是：

1. 它解决什么问题
2. 它的包名和 `Mo.Add*()` 入口是什么
3. 它有哪些公开 Option
4. 它有哪些 Guide 方法
5. 它依赖哪些相关模块或配套 UI 模块

## 下一步

- [Option 与 Guide](./configuration-and-guide.md)
- [模块文档目录](../modules/index.md)
