---
title: 创建第三方 Monica 包
description: 使用 Monica 开发 Skill 创建可直接发布的独立模块包。
sidebar_position: 1
---

# 创建第三方 Monica 包

Monica 第三方生态允许个人或组织独立发布模块，同时让包身份、模块发现与品牌表达保持一致。第三方包可以开源、闭源、免费或收费；“兼容 Monica”并不等于官方包，也不代表 Monica 团队已经审查。

## 从 Skill 开始

标准开发 Skill 位于 Monica 仓库的 `.agents/skills/monica-third-party-module-development`。先让 Codex 从该仓库安装 Skill，再按名称调用：

```text
$skill-installer Install monica-third-party-module-development from
Tairitsua/Monica, path .agents/skills/monica-third-party-module-development.
```

```text
$monica-third-party-module-development 创建一个可发布的
Acme.Monica.Analytics 包，其中包含 Analytics、Alerts 和 Analytics UI 模块，
使用 MIT 许可证，通过 GitHub 发布到 nuget.org，并支持我选择的 Monica 版本。
```

Skill 会在生成文件前确认发布者、包用途、模块集合、运行时类型、Monica 版本、许可证、分发渠道和 NuGet 所有者，不会擅自选择许可证。

## Skill 会生成什么

- SDK 风格的 `.NET` 仓库与 `.slnx` 解决方案
- 一个包含一个或多个内聚 Monica 模块的包项目
- Module、Option、Guide 与 `IMonicaBuilder` 注册入口
- 按需生成非 Web、Web、Provider/Integration、混合 UI 或独立 UI 结构
- 通过真实 Monica 宿主完成组合的社会性测试
- NuGet 元数据、包 README、兼容标识与许可证配置
- CI，以及优先使用 NuGet Trusted Publishing 的 GitHub Actions 发布流程
- 从干净本地源还原并消费已打包产物的验证流程

生成代码只是发布者拥有并维护的起点。正式发布前仍需审查公开 API、依赖、安全行为与法律条款。

## v1 核心契约

1. NuGet 包 ID 使用 `<Publisher>.Monica.<Package>[.<Variant>]`。
2. 一个包可以包含任意数量、彼此内聚的模块。
3. 每个模块键必须等于 `PackageId`，或以 `PackageId.` 开头。
4. `Monica.*` 与紫色官方 Logo 仅供 Monica 官方包使用。
5. 第三方包可以使用绿色 Monica 兼容标识，也可以使用发布者自己的图标。
6. 明确兼容性由发布者自我声明，并标出独立发布者。
7. 使用完整元数据、测试、许可证表达式或许可证文件，以及可复现的发布流程。

## 继续阅读

- [包与品牌规范](./package-and-branding-standard.md)
- [多模块包架构](./multi-module-package-architecture.md)
- [创建流程](./creation-workflow.md)
- [质量检查清单](./quality-checklist.md)
- [发布到 NuGet](./publish-to-nuget.md)
- [许可证与商业使用](./licensing-and-commercial-use.md)
