---
title: ProjectUnits 源码分析
description: 基于 MSBuild 工作区生成可序列化的源码级项目单元目录。
sidebar_position: 1
---

# ProjectUnits 源码分析

`Monica.ProjectUnits.CodeAnalysis` 使用 MSBuild 和 Roslyn 语义模型分析选定 C# 项目中的 Monica ProjectUnit。它不会加载业务程序集，也不会启动应用宿主，因此架构控制台和 Agent 工具可以把整个仓库作为一个工作区检查。

## 适用场景

- 把多个服务或模块分析为一个架构目录。
- 在服务可运行之前统计源码元数据和需求注解。
- 解析项目单元之间的构造函数依赖和契约依赖。
- 由上层工作流产品持久化或比较稳定的源码快照。

如果当前运行宿主才是权威来源，并且需要其运维面板或 HTTP 接口，应使用 [`Monica.ProjectUnits`](../project-units/index.md)。

## 包与注册

| 项目 | 值 |
|---|---|
| 包 | `Monica.ProjectUnits.CodeAnalysis` |
| 注册入口 | `monica.AddProjectUnitCodeAnalysis()` |
| 必需模块 | `Monica.ProjectUnits`，会作为模块依赖注册 |
| 相关 UI 模块 | 无；聚合与展示由消费方负责 |

## 公开边界

- `IProjectUnitSourceAnalyzer` 启动一次可取消的语义分析。
- `ProjectUnitSourceAnalysisRequest` 提供工作区根目录和选定项目文件。
- `ProjectUnitSourceAnalysisProgress` 报告初始化、加载、分析、依赖解析和完成阶段。
- `ProjectUnitSourceCatalog` 保存可序列化的单元、依赖、源码位置、元数据、需求和诊断。
- `ProjectUnitSourceAnalysisContract.Version` 使用 `monica-project-units-source/v1` 标识持久化契约。

目录键格式为 `{项目相对路径}::{类型完整名称}`。`RuntimeKey` 保留运行宿主使用的 CLR 完整类型名。

## 后续阅读

- [快速开始](./quick-start.md)
- [分析契约](./configuration.md)
- [Guide 与依赖](./guide-and-providers.md)
- [使用场景](./scenarios.md)
