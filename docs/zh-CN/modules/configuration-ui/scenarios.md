---
title: Scenarios
description: Configuration UI 的常见使用方式和注意事项。
sidebar_position: 5
---

# Scenarios

## 场景 1 — 内部运维配置台

在内部管理应用中注册 `Mo.AddConfigurationUI()`，即可提供配置查看、编辑和历史页面。建议同时启用 EF Core provider，这样配置修改和 mutation group 不会在重启后丢失。

## 场景 2 — 演示和开发环境

只使用 `Mo.AddConfiguration()` 和 `Mo.AddConfigurationUI()` 时，默认内存来源已经可写。开发者可以直接尝试编辑配置并观察 `IOptionsSnapshot<T>` / `IOptionsMonitor<T>` 的效果。

## 场景 3 — 排查配置来源

当某个值看起来“不对”时，先在配置状态页选择该配置项，再查看来源链路。来源链路会按优先级展示每个 source 是否有值，以及哪个 source 最终生效。

## Common mistakes

- 以为 UI 会自动持久化到数据库。没有启用 EF Core 或其他持久化 source 时，默认写入内存。
- 以为修改后所有值都能热更新。`RequiresRestart` 和 `StaticAfterStartup` 节点会提示需要重启。
- 以为敏感值能在 UI 中完整查看。敏感值默认按 display-safe 方式处理。
- 把 UI 当作 provider 扩展点。provider 扩展应在 `Monica.Configuration` 中实现 `IConfigurationValueSource`。
