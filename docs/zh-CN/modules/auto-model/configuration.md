---
title: Configuration
description: AutoModel 的公开选项、默认值与必需设置。
sidebar_position: 3
---

# Configuration

## Module options

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `EnableActiveMode` | `bool` | `false` | 否 | 你只想暴露显式标注的字段时 | 打开后，未标记 `AutoFieldAttribute` 的字段不会参与 AutoModel。 |
| `EnableIgnorePrefix` | `bool` | `false` | 否 | 你希望默认激活名更宽松时 | 允许省略前缀匹配。 |
| `EnableIgnorePrefixAutoAdjust` | `bool` | `false` | 否 | 已开启前缀省略且你不希望自动调整失败直接抛错时 | 只影响自动调整失败时的容错。 |
| `EnableDebugging` | `bool` | `false` | 否 | 你要观察表达式归一化后的结果时 | 便于排查 DSL 到最终查询表达式的映射。 |
| `EnableTitleAsActivateName` | `bool` | `false` | 否 | 不建议使用 | 源码标记为 `[Obsolete]`，尚未实现。 |
| `DisableAutoIgnorePropertyWithJsonIgnoreAttribute` | `bool` | `false` | 否 | 你希望即使带有 `JsonIgnore` 也仍参与 AutoModel 时 | 默认会自动忽略这类属性。 |
| `DisableAutoIgnorePropertyWithNotMappedAttribute` | `bool` | `false` | 否 | 你希望即使带有 `NotMapped` 也仍参与 AutoModel 时 | 默认会自动忽略这类属性。 |
| `EnableErrorForUnsupportedFieldTypes` | `bool` | `false` | 否 | 你要在启动期快速发现不支持的字段类型时 | 打开后，遇到无法处理的字段会直接报错。 |
| `DisableExceptionHandling` | `bool` | `false` | 否 | 你不希望模块自动声明异常处理依赖时 | 默认会接入异常处理模块依赖。 |
