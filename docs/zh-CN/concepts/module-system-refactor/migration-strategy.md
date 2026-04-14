---
title: 迁移策略与落地顺序
description: 给出从现有模块系统迁移到新模型的推荐阶段、试点模块和验收标准。
sidebar_position: 4
---

# 迁移策略与落地顺序

即使目标架构允许 breaking changes，也不代表应该一次性重写所有模块。更稳妥的做法是：先把新内核抽象建立起来，再让高价值模块优先迁移，最后统一收口旧模型。

## 推荐迁移原则

## 1. 先建新模型，再迁老模块

不要先在旧系统上继续叠加特判，再期待以后平滑迁移。

更合理的顺序是：

1. 先定义新的 descriptor / resolved config / contribution / export 抽象
2. 再选一组代表性模块做试点
3. 验证新模型足够表达现有真实需求
4. 最后批量迁移

## 2. 先迁移 owner 模块

因为新系统高度依赖 owner-owned contribution，所以第一批优先迁移的应当是 owner 模块，例如：

- `ShellUI`
- `Swagger`
- `SwaggerUI`
- `Localization`
- `ModuleSystemUI`

这些模块一旦先迁好，其他模块就能自然改用 contribution。

## 3. 先迁“跨模块写 option”的热点模块

优先解决那些当前最依赖跨模块写配置的场景，例如：

- 页面注册
- 根路由与路由重定向
- Swagger UI 扩展
- 导航按钮与导航分类

因为这些地方最能体现新模型价值。

## 建议迁移阶段

## 阶段 0：冻结现有问题扩散

在真正大改之前，先建立几条临时规则：

- 新代码禁止把 `Option` 当运行时共享状态容器
- 新代码禁止在 `ClaimDependencies` 读取别的模块最终配置
- 新代码新增跨模块协作时，优先设计 owner-owned API

这一步的目标是停止继续积累债务。

## 阶段 1：引入新核心抽象

实现最小可用的新内核：

- `IModuleDescriptor`
- `ResolvedConfig`
- 强类型 `ModuleContext`
- `ContributionCollector`
- `ExportProvider`

这一步不要求所有模块立刻迁移，但新模型必须能独立跑通。

## 阶段 2：迁移一条完整试点链路

推荐的第一条试点链路：

- `Swagger`
- `SwaggerUI`
- `ShellUI`

原因：

- 问题真实存在
- 跨模块配置读取需求明确
- contribution owner 也清楚
- 能快速验证“读取依赖配置 + 提交 owner contribution”的组合模型

试点完成后的目标能力：

- `Swagger` 产出 `SwaggerResolvedConfig`
- `SwaggerUI` 读取 `SwaggerResolvedConfig.RoutePrefix`
- `SwaggerUI` 向 `ShellUI` 提交 root redirect contribution
- `ShellUI` 统一 reduce redirect contribution 并做冲突校验

## 阶段 3：迁移页面与导航注册

把所有 UI 页面注册迁到统一 contribution 模型。

建议抽象：

- `PageContribution`
- `NavItemContribution`
- `RouteRedirectContribution`

此时应彻底收口“直接改 page registry option”的旧做法。

## 阶段 4：迁移配置读取 API

当主要 owner 模块已经迁好后，再统一替换旧的跨模块配置读取方式。

目标：

- 模块实例中的 `GetOptions<T>()` 不再作为默认方案
- Guide 中不再隐式依赖全局静态注册表
- 跨模块配置读取统一通过新 context 完成

## 阶段 5：删除旧生命周期耦合

最后清理旧系统遗留：

- 删除在 `ClaimDependencies` 临时实例化模块的做法
- 删除大量字符串 key 去重逻辑
- 删除把他模块 option 当写入目标的模式
- 压缩 `ModuleRegistry` 的静态职责

## 推荐试点模块顺序

如果只看重构收益和风险平衡，我建议按下面顺序推进：

1. `ShellUI`
2. `Swagger`
3. `SwaggerUI`
4. `SystemInfoUI`
5. `ModuleSystemUI`
6. 其他页面型 UI 模块
7. 更底层的通用基础设施模块

原因：

- 前三者最能验证配置读取与 contribution 模型
- `SystemInfoUI` 能继续验证跨模块 UI 集成
- 页面型 UI 模块迁移后，文档和接入体验也会更统一

## 验收标准

一轮迁移是否算完成，不建议只看“能不能编译”，而应至少满足下面这些标准。

## 架构标准

- 依赖声明阶段不读取最终配置
- owner 模块拥有自己的最终聚合权
- 模块间配置读取只发生在受控上下文
- 旧的跨模块 option 写入路径已删除或封存

## 可维护性标准

- 配置读取失败错误信息能指出源模块、目标模块和当前阶段
- contribution 冲突错误能指出冲突 key 与 source module
- 新增模块作者不需要理解旧系统隐藏时序就能安全接入

## 用户体验标准

- `Mo.Add*()` 的对外调用体验尽量保持统一
- 常见集成场景的写法比旧系统更短或至少更清晰
- 文档中能明确回答“这个场景该读 config 还是发 contribution”

## 最终收口目标

当这轮重构结束时，理想状态不是“旧系统和新系统永远共存”，而是：

- 新系统成为默认模块编写模型
- 旧 API 只保留必要的兼容层或完全删除
- 模块系统中的阶段、安全边界和 owner 责任都能从 API 表面直接看出来
