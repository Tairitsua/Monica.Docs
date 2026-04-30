---
title: Quick Start
description: 定义第一个 Monica AI Skill。
sidebar_position: 2
---

# Quick Start

## 安装包

```bash
dotnet add package Monica.AI
```

如果只是在非 AI 项目中声明 Skill 基类和 `[SkillTool]`，公共类型来自 `Monica.Core`；真正自动发现和 Agent 适配仍需要 `Monica.AI` 中的 `Mo.AddAISkillSystem()` 或 `Mo.AddAI()`。

## 最小注册

```csharp
using Monica.Modules;

Mo.AddAISkillSystem();
```

`Mo.AddAI()` 会自动依赖并注册 Skill System。只有在你想单独启用 Skill 发现时，才需要显式调用 `Mo.AddAISkillSystem()`。

## 定义 Skill

```csharp
using Monica.Core.Skills;
using Monica.Core.Skills.Annotations;
using Monica.Core.Skills.Models;

public sealed class FlightOpsSkill : Skill<FlightOpsSkill>
{
    public override SkillDefinition Definition { get; } = new(
        "flight-ops",
        "Flight operation helper tools.",
        "Use these tools when the user asks about operational flight data.");

    [SkillTool(Description = "Returns a short operational summary for one flight.")]
    public Task<string> GetFlightSummaryAsync(
        [SkillTool(Description = "Flight number, for example CA1234.")]
        string flightNo,
        IServiceProvider services)
    {
        // Tool methods can use ordinary parameters. The AI runtime also supports
        // IServiceProvider when dependency access is needed.
        return Task.FromResult($"Flight {flightNo} is ready for review.");
    }
}
```

## 在聊天中显式引用

组合 `Mo.AddAIUI()` 后，聊天输入框支持 `/` 斜杠命令。输入 Skill 名称的一部分并按 `Tab`，UI 会把 Skill 补全成一个显式引用 Badge，发送消息时该引用会写入聊天运行时上下文。

## 接下来读什么

- [Guide and Providers](./guide-and-providers.md)
- [AI UI](../ai-ui/index.md)
