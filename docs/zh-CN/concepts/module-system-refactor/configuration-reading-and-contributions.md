---
title: 配置读取与 Contribution 模型
description: 定义新模块系统里最合理的跨模块配置读取方式与 owner-owned contribution 模式。
sidebar_position: 3
---

# 配置读取与 Contribution 模型

这轮模块系统重构里，最核心的问题不是“怎么更方便地拿到别人的配置”，而是：

**哪些信息应该被读取，哪些信息应该被 owner 聚合，哪些协作应该被建模为 contribution。**

## 跨模块协作的三种合法方式

我建议新系统只保留三种标准协作方式。

## 1. 读取自己的配置

模块在任何允许读取配置的阶段，都应该通过：

```csharp
ctx.Config
```

读取自己的 `ResolvedConfig`。

特点：

- 强类型
- 无歧义
- 与模块生命周期绑定

## 2. 读取直接依赖模块的只读配置

如果一个模块确实需要根据依赖模块的配置做决策，应通过：

```csharp
var swagger = ctx.GetRequiredConfig<SwaggerModule, SwaggerResolvedConfig>();
```

读取依赖模块的 **Resolved Config**。

这类读取必须满足：

- 目标模块是直接依赖
- 读取发生在 config resolve 之后
- 读取结果是只读快照

## 3. 向 owner 模块提交 contribution

如果一个模块想影响 owner 模块的最终行为，优先使用：

```csharp
ctx.Contribute(new RouteRedirectContribution(...));
```

而不是直接改 owner 的配置。

这是最值得推广的协作方式。

## 什么情况下应该“读配置”

适合读取依赖配置的场景：

- 你需要知道依赖模块公开的稳定配置结果
- 这个信息本来就属于依赖模块
- 你只是基于它做自己的决策

例子：

- `SwaggerUI` 读取 `SwaggerResolvedConfig.RoutePrefix`
- `SystemInfoUI` 读取 `ShellResolvedConfig` 的公开导航策略
- `MarkdownUI` 读取 `MarkdownResolvedConfig` 的公开功能开关

## 什么情况下不应该“读配置”

下面这些情况通常不应该直接读配置：

- 你想向别的模块追加注册项
- 你想改别的模块的聚合结果
- 你想让别的模块多映射一个 endpoint / route / page
- 你想参与别的模块拥有的最终表结构或注册表

这些都更适合 contribution。

## Owner-owned Contribution 模型

owner-owned contribution 的核心原则是：

**谁拥有最终结果，谁定义 contribution 结构、合并规则和冲突处理。**

## 例子 1：Route Redirect

错误设计：

- `SwaggerUI` 直接改 `ShellOption.RouteRedirects`

更优设计：

```csharp
public sealed record RouteRedirectContribution(
    string FromPath,
    Func<string> ResolveTargetPath,
    ModuleKey SourceModule);
```

然后：

- `SwaggerUI` 提交 `RouteRedirectContribution`
- `Shell` 聚合全部 redirect contribution
- `Shell` 统一做路径归一化、重复检查和最终映射

## 例子 2：页面注册

错误设计：

- 所有 UI 模块都直接改 `PageRegistryOption`

更优设计：

- `Shell` 定义 `PageContribution`
- 各 UI 模块提交页面、分类、图标、排序等信息
- `Shell` 统一决定导航结构和冲突策略

## 例子 3：Swagger Toolbar Button

错误设计：

- 业务模块直接改 SwaggerUI 的按钮列表 option

更优设计：

- `SwaggerUI` 定义 `SwaggerToolbarButtonContribution`
- 业务模块提交按钮 contribution
- `SwaggerUI` 聚合、排序、去重、注入前端配置

## Config、Contribution、Export 的边界

可以用下面这张表快速判断应该用哪一种。

| 需求 | 推荐方式 | 原因 |
|---|---|---|
| 读取依赖模块的稳定配置结果 | `ResolvedConfig` | 只读、明确、阶段安全 |
| 影响 owner 模块的最终聚合结果 | `Contribution` | owner 拥有合并权 |
| 读取依赖模块最终暴露的运行时能力 | `Export` | 语义比配置更准确 |
| 想让别的模块“多注册一点东西” | `Contribution` | 不应直接写别人配置 |
| 想知道依赖模块最终运行模式 / capability | `Export` 或 `ResolvedConfig` | 取决于它是配置结果还是运行时产物 |

## 推荐的读取规则

## 1. 默认只允许读直接依赖

不要允许模块任意读取整个系统里任何模块的配置。

原因：

- 会破坏依赖边界
- 会让模块图形同虚设
- 会引入隐式耦合

## 2. 读取失败应是明确的框架错误

如果模块尝试读取：

- 未声明依赖的模块
- 尚未冻结配置的模块
- 未暴露的 export

框架应抛出带有：

- 源模块
- 目标模块
- 当前阶段
- 期望阶段

的清晰错误。

## 3. 路径归一化、重复检查、排序规则由 owner 负责

以 `RouteRedirectContribution` 为例：

- `/swagger`
- `swagger`
- `~/swagger`

这些归一化逻辑不该散落在调用方，而应统一放在 `Shell` reduce 阶段。

## 4. contribution 聚合应可诊断

owner 在冲突时报错时，应该能告诉你：

- 哪个模块提交了第一条 contribution
- 哪个模块提交了冲突项
- 冲突的 key / path / name 是什么

这是新系统优雅度的重要指标。

## 推荐 API 草图

```csharp
public interface IConfigReadContext<out TConfig>
{
    TConfig Config { get; }

    TDepConfig GetRequiredConfig<TDepModule, TDepConfig>()
        where TDepModule : IModuleDescriptor;
}

public interface IContributionWriteContext
{
    void Contribute<TContribution>(TContribution contribution);
}

public interface IExportReadContext
{
    TExport GetRequiredExport<TDepModule, TExport>()
        where TDepModule : IModuleDescriptor;
}
```

## 一句话原则

在新模块系统里，最合理的配置读取方式不是“让任何模块都能随时拿到任何 option”，而是：

**只在正确阶段，通过强类型上下文，读取直接依赖模块的只读配置快照；凡是会影响 owner 最终结果的协作，都优先建模成 contribution。**
