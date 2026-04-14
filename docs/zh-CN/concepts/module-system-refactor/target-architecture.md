---
title: 目标架构与生命周期
description: 定义新模块系统的核心抽象、生命周期阶段和模块上下文模型。
sidebar_position: 2
---

# 目标架构与生命周期

如果允许对现有模块系统做完整重构，我建议把核心模型收敛为四个明确层次：

1. `Descriptor`：只描述模块，不执行逻辑
2. `ResolvedConfig`：只读配置快照
3. `Context`：阶段化、强类型的读取与协作入口
4. `Contribution / Export`：模块之间的标准协作机制

## 目标对象模型

## 1. Module Descriptor

`ModuleDescriptor` 是模块的静态描述对象。它负责回答：

- 模块 key 是什么
- 依赖哪些模块
- 暴露哪些 contribution 类型
- 暴露哪些 export 类型
- 支持哪些生命周期阶段

它不负责：

- 读取最终配置
- 实例化运行时服务
- 直接操作 `IServiceCollection`

## 2. Resolved Config

每个模块都应有两类配置对象：

- `ModuleOption`：外部写入入口，仍然适合承载用户输入
- `ResolvedConfig`：系统冻结后的只读快照，作为跨模块读取的唯一来源

建议原则：

- `Option` 可以保留当前 `Mo.Add*()` 的用户体验
- `ResolvedConfig` 是模块内部和跨模块读取的标准对象
- 模块之间不再读取彼此的 `Option`

## 3. Module Context

生命周期方法不再裸露 `IServiceCollection` 或全局静态工具，而是通过强类型上下文工作。

一个理想的接口形态可以类似这样：

```csharp
public interface IModuleContext<out TResolvedConfig>
{
    TResolvedConfig Config { get; }

    TDepConfig GetRequiredConfig<TDepModule, TDepConfig>()
        where TDepModule : IModuleDescriptor;

    TExport GetRequiredExport<TDepModule, TExport>()
        where TDepModule : IModuleDescriptor;

    void Contribute<TContribution>(TContribution contribution);
}
```

这个模型的重点不是语法，而是约束：

- 读自己配置走 `Config`
- 读依赖配置走 `GetRequiredConfig`
- 读运行时能力走 `GetRequiredExport`
- 向 owner 提交协作信息走 `Contribute`

## 4. Contribution 与 Export

新系统应明确区分两类跨模块协作：

### Contribution

Contribution 是“我向 owner 模块提交一个可聚合输入”。

例子：

- `RouteRedirectContribution`
- `PageContribution`
- `SwaggerToolbarButtonContribution`
- `LocalizationResourceContribution`

特点：

- owner 模块定义 contribution 结构和聚合规则
- 其他模块只能提交 contribution，不能直接改 owner 配置
- 冲突校验由 owner 负责

### Export

Export 是“模块对外公开的只读能力或契约”。

例子：

- `IShellRouteRegistry`
- `ISwaggerRouteInfo`
- `IModuleCapabilityCatalog`

特点：

- Export 是模块对外可读、可依赖的能力
- 它不是用户配置，也不是跨模块写入口
- 更适合表达运行时能力或已聚合结果

## 推荐生命周期

新的模块系统可以收敛为下面几个阶段。

## 1. Discovery

发现所有模块描述对象并建立初始模块图。

输出：

- 模块列表
- 模块 key
- 初始依赖声明

## 2. Dependency Graph Validation

验证依赖图是否合法。

检查：

- 模块 key 冲突
- 依赖环
- 缺失依赖
- 非法 capability 引用

## 3. Config Binding

将用户输入、默认值和额外配置绑定到各模块的 `Option Input`。

这里仍可保留当前 `Mo.Add*()` 的调用体验，但内部不再把 option 直接视为最终可共享配置。

## 4. Config Resolve

按拓扑顺序把每个模块的 `Option Input` 解析成 `ResolvedConfig`。

这一步允许读取直接依赖模块的 `ResolvedConfig`，但不允许读取运行时 service。

这是跨模块配置读取最合理的阶段。

## 5. Contribution Collect

允许模块根据自身 `ResolvedConfig` 和依赖的 `ResolvedConfig`，向 owner 模块提交 contribution。

例如：

- `SwaggerUI` 提交 root route redirect contribution 给 `Shell`
- `SystemInfoUI` 提交页面 contribution 给 `Shell`
- `Markdown` 提交 markdown asset resolver contribution 给 UI owner

## 6. Contribution Reduce

由 owner 模块统一聚合 contribution，生成自己的聚合结果或 export。

这一步是新系统优雅度的关键：

- 重复检测放在 owner
- 合并优先级放在 owner
- 冲突错误信息带上 source module

## 7. Service Registration

现在才开始服务注册。

服务注册阶段能读取：

- 自己的 `ResolvedConfig`
- 依赖模块的 `ResolvedConfig`
- 已完成 reduce 的 owner export

## 8. App Pipeline / Endpoint / UI Composition

最后才进入 Web pipeline、endpoint 和 UI composition 阶段。

这个阶段不应该再推导新的模块图和配置图，只消费前面已经冻结好的结果。

## 模块边界规则

## 1. 依赖声明不读配置

`DescribeDependencies()` 只能声明依赖，不能读取别人的最终配置。

## 2. 配置读取只读 `ResolvedConfig`

模块间禁止读取对方可变 `Option`。

## 3. 跨模块写入优先变成 Contribution

如果 A 模块想“让 B 模块多注册一点东西”，优先建 contribution，而不是让 A 直接改 B 的 option。

## 4. 运行时能力优先变成 Export

如果 A 模块只是想读 B 模块最终生成的能力或信息，用 export，而不是读配置。

## 5. 配置可见性以依赖图为边界

默认只允许读取直接依赖模块的 `ResolvedConfig` 或 `Export`。

如果要跨两层读取，必须显式暴露 export，而不是默认穿透。

## 一个典型例子：Swagger 与 Shell

在目标设计里，`SwaggerUI` 不再直接改 `Shell` 的 route redirect option。

更合理的协作方式是：

1. `Swagger` 先生成 `SwaggerResolvedConfig`
2. `SwaggerUI` 读取 `SwaggerResolvedConfig.RoutePrefix`
3. `SwaggerUI` 向 `Shell` 提交 `RouteRedirectContribution("/", "/{RoutePrefix}")`
4. `Shell` 统一收集所有 route redirect contribution
5. `Shell` 校验重复、归一化路径、生成最终路由表

这样每个职责都更清楚：

- `Swagger` 拥有自己的配置
- `SwaggerUI` 决定是否需要首页跳转
- `Shell` 拥有最终路由聚合权
