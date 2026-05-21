---
title: Scenarios
description: Configuration UI 的常见使用方式和注意事项。
sidebar_position: 5
---

# Scenarios

## 场景 1 — 内部运维配置台

在内部管理应用中注册 `Mo.AddConfigurationUI()`，即可提供配置查看、编辑和历史页面。单体应用可使用 file store；分布式应用应使用 DB store，这样所有实例共享同一份 effective values、metadata 和 history。

## 场景 2 — 演示和开发环境

开发环境通常这样注册：

```csharp
Mo.AddConfiguration()
    .UseFileConfigurationStore();
Mo.AddConfigurationUI();
```

File store 会在本地生成 effective JSON document，适合观察复杂对象、dictionary、list item key、敏感值和重启提示。

## 场景 3 — 排查配置存储状态

Storage 页面展示当前 active store bundle：

- Effective values store。
- Metadata store。
- History store。
- 是否注册了 change notifier。
- 本进程最近一次 store operation 是否成功。

旧版的 source chain 和 source priority 不再存在。`appsettings` 和环境变量只用于 bootstrap/seed，不作为 UI 中的运行期来源展示。

## Common mistakes

- 以为 UI 会自动选择存储。核心模块必须显式配置 `UseFileConfigurationStore(...)` 或 `UseDbConfigurationStore(...)`。
- 以为修改后所有值都能热更新。`RequiresRestart` 和 `StaticAfterStartup` 节点会提示需要重启。
- 以为敏感值能在 UI 中完整查看。敏感值默认按 display-safe 方式处理。
- 把 UI 当作 store 扩展点。store 扩展应在 `Monica.Configuration` 中实现 effective value、metadata 和 history store contract。
