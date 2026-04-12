---
title: Configuration
description: ProjectUnits 的公开选项、默认值与必需设置。
sidebar_position: 3
---

# Configuration

## Module options

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `ConventionOptions` | `ProjectUnitNamingOptions` | `new()` | 否 | 你要启用或调整命名约定治理时 | 命名规则的总入口。 |
| `EnableRequestFilter` | `bool` | `false` | 否 | 你需要启用请求过滤中间件时 | 会额外接入请求过滤相关能力。 |
| `ParseUnitDetails` | `bool` | `true` | 否 | 你想关闭详细元数据解析以缩减处理量时 | 关闭后不会解析某些更细的项目单元细节。 |

## 额外选项 `ProjectUnitNamingOptions`

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `Dict` | `Dictionary<EProjectUnitType, ProjectUnitNamingRule>` | `[]` | 否 | 你要为特定项目单元类型覆盖规则时 | 为不同单元类型单独设置前缀、后缀或包含规则。 |
| `NameConventionMode` | `ENameConventionMode` | `Warning` | 否 | 你要设置全局命名校验模式时 | 默认只警告，不阻断启动。 |
| `EnableNameConvention` | `bool` | `false` | 否 | 你准备启用命名治理时 | 总开关。 |
