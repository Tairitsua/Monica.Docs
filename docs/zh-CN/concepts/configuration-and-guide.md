---
title: Option 与 Guide
description: 理解公开配置项、额外选项与 Guide 必需配置。
sidebar_position: 2
---

# Option 与 Guide

在 Monica 中，**不是所有配置都应该直接变成一个布尔开关或字符串属性。**

## 什么时候用 `ModuleOption`

适合放进 `ModuleOption` 的内容通常有这些特征：

- 是公开、稳定、用户能直接理解的配置项
- 有清晰的默认值
- 可以用表格列出来说明用途、默认值和何时修改

例子：

- `ModuleConfigurationOption.GenerateFileForEachOption`
- `ModuleJobSchedulerOption.MaxWorkerExecutionThreads`
- `ModuleProjectUnitsOption.ParseUnitDetails`

## 什么时候用 `ModuleGuide`

适合做成 Guide 方法的内容通常有这些特征：

- 是“启用某种能力”的动作，而不是单纯的值配置
- 涉及服务注册、Provider 选择或必需依赖声明
- 同一个需求可能有多种实现方式二选一 / 多选一

例子：

- `UseInMemoryMetadataRepository()`
- `UseSchedulerScope("local-dev")`
- `MapSignalRHub<THub>("/signalr/chat")`
- `SetChannelBuilder<TSetup>()`

## 额外选项

有些模块还会使用**额外选项**而不是把所有内容都塞进 `ModuleOption`。例如 `AutoControllers` 的第二个参数 `crudOptionAction` 实际上配置的是 `CrudControllerOption`。

这类配置一般用于：

- 某个子能力的专用参数
- 不适合混在主模块选项里的附加规则

## 必需 Guide 配置

有些模块会在内部声明“必需配置键”，如果你没调用对应的 Guide 方法，模块系统会在启动时直接报错。

典型模块：

- `JobScheduler`：必须选元数据仓储、Provider、Scope
- `SignalR`：必须调用 `AddSignalR<...>()`
- `DataChannel`：必须提供 `SetChannelBuilder<T>()`

## 文档写法建议

阅读 Monica 模块文档时，可以先找两个区块：

1. **Configuration**：看 Option / Extra Option
2. **Guide and Providers**：看 Guide 方法、必需配置、Provider 选择
