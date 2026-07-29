---
title: Monica 文档
description: 使用人类与编码 Agent 都能遵循的架构，构建可观测的 .NET 后端。
sidebar_position: 1
---

# Agent 能遵循的架构

Monica 是面向可观测 .NET 后端的 Agent-governed application architecture。它把基础设施模块、DDD 项目单元和运行时检查统一为一份显式契约，让编码 Agent 不必在每个功能里重新猜测架构，也让开发者与运维人员能看到应用实际启动了什么。

## 从这里开始

- [快速开始](./getting-started/index.md)：安装 Stable 包并启动第一个宿主。
- [主机绑定的模块组合](./concepts/module-pattern.md)：理解 `builder.AddMonica(...)`、模块图与生命周期边界。
- [项目单元编写](./concepts/project-unit-authoring.md)：用明确的应用与领域角色组织业务代码。
- [执行边界](./concepts/execution-boundaries.md)：理解统一执行管线在哪些入口运行，以及 DynamicProxy 为什么保持可选。
- [测试 Monica 应用](./guides/testing-monica-applications.md)：在完整宿主场景、原始 ProjectUnit Fixture 与 UI 测试之间选择真实边界。
- [模块目录](./modules/index.md)：按需选择基础设施、集成与实验能力。
- [包成熟度](./packages/index.md)：理解 Stable、Integrations 与 Labs 的官方承诺。
- [第三方生态](./ecosystem/index.md)：研发、标识、授权并发布独立 Monica 模块包。
- [场景指南](./scenarios/index.md)：把多个模块组合成可运行方案。

## 核心路径

```text
Agent guidance -> typed ProjectUnits -> validated module graph -> inspectable runtime
```

同一套架构词汇会出现在源码、Agent 技能、模块诊断和运维界面中。架构不会在应用启动后消失，而是继续作为可查询、可验证的运行时事实存在。

## 一个显式宿主边界

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.ConfigureApplication(options =>
    {
        options.AppName = "Orders";
        options.AppId = "orders";
    });

    monica.AddProjectUnits();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

`AddMonica(...)` 是完整的服务组合边界：所有模块、Option、Guide 与依赖关系都属于当前宿主。Web 宿主在 `Build()` 后再调用 `UseMonica()` 和 `MapMonica()`；不存在进程级的环境注册入口。

## 文档语言

英文是公开发布路由与核心采用指南的默认语言，简体中文则保留现有、更完整的第一等文档体系。两种语言的主机组合、包成熟度、模板、参考应用和 Stable 核心能力必须保持一致；尚未翻译的深度页面会明确缺席，而不会用不准确的内容填充。
