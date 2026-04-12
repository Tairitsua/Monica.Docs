---
title: Configuration
description: Configuration 的公开选项、默认值与必需设置。
sidebar_position: 3
---

# Configuration

## Module options

| Property | Type | Default | Required | When to change | Notes |
|---|---|---|---|---|---|
| `ErrorOnUnknownConfiguration` | `bool` | `false` | 否 | 你想对额外键做严格校验时 | 打开后，绑定时发现多余键会抛出异常。 |
| `ErrorOnNoTagConfigAttribute` | `bool` | `false` | 否 | 你希望未标记 `[Configuration]` 的类型直接失败时 | 默认只记录错误。 |
| `ErrorOnNoTagOptionAttribute` | `bool` | `false` | 否 | 你要求配置属性都显式带 `OptionSettingAttribute` 时 | 更适合配置治理要求较高的项目。 |
| `EnableReadConfigLogging` | `bool` | `false` | 否 | 暂不建议依赖 | 源码注明尚未实现完整能力。 |
| `EnableConfigRegisterLogging` | `bool` | `false` | 否 | 你要观察启动期配置注册过程时 | 适合排查扫描与绑定问题。 |
| `AppConfiguration` | `IConfiguration` | 无默认值 | 是 | 始终需要设置 | 通常直接传入 `builder.Configuration`。 |
| `EnableLoggingWithoutOptionSetting` | `bool` | `false` | 否 | 你允许未标记 `OptionSettingAttribute` 的属性也参与日志显示时 | 更宽松，但配置元数据会变得不够显式。 |
| `GenerateFileForEachOption` | `bool` | `false` | 否 | 你希望按配置类型生成本地配置文件时 | 适合把配置文件管理也纳入模块。 |
| `GenerateOptionFileParentDirectory` | `string?` | `"configs"` | 否 | 你要调整生成文件目录时 | 只有开启 `GenerateFileForEachOption` 后才有明显意义。 |
| `RemovedPropertyHandling` | `RemovedPropertyHandling` | `Comment` | 否 | 你希望自定义移除属性时的本地文件处理策略时 | 影响本地 JSON 文件更新行为。 |
| `SetOtherSourceAction` | `Action<ConfigurationManager>?` | `null` | 否 | 你还要追加更高优先级的配置源时 | 后读入的配置源优先级更高。 |

## Required setup

| Requirement | Satisfied by | Notes |
|---|---|---|
| `AppConfiguration` | 在 `Mo.AddConfiguration(o => { o.AppConfiguration = builder.Configuration; })` 中赋值 | 没有配置根，模块无法正确绑定配置类型。 |
