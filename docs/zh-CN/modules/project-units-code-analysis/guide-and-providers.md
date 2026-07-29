---
title: Guide 与依赖
description: 了解源码分析的注册、生命周期、并发和模块依赖。
sidebar_position: 4
---

# Guide 与依赖

## Guide 方法

| 方法 | 启用能力 | 是否必需 | 典型用途 |
|---|---|---|---|
| `AddProjectUnitCodeAnalysis()` | 注册单例 `IProjectUnitSourceAnalyzer`，并声明 ProjectUnits 依赖。 | 是 | 仓库架构分析和 Agent 工具。 |

返回的 `ModuleProjectUnitCodeAnalysisGuide` 没有 Provider 选择方法，`ModuleProjectUnitCodeAnalysisOption` 当前也没有设置项。

## 运行行为

- 同一进程内的分析调用会串行执行，因为 MSBuild 工作区注册和大型语义加载属于进程级资源。
- 进度回调可能在后台线程执行。
- 调用方负责作业合并、缓存持久化、过期判断和面向用户的进度状态。
- 分析过程不会启动选定应用宿主，也不会执行其启动管线。

## 模块依赖

模块声明了 `ModuleProjectUnitsGuide` 依赖，因此源码分类与运行时发现使用相同的公开 ProjectUnit 契约和 `EProjectUnitType` 词汇。
