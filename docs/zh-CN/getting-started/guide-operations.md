---
title: Guide 运维与安全
description: 了解 Monica Guide 的发布、更新、源码绑定、托管状态、恢复机制与贡献安全边界。
sidebar_position: 3
---

安装 [Monica Guide 工具箱](./agent-setup.md)后、维护全局绑定或现有工作区时，或在 Monica 贡献仓库中工作时，请使用本页。`monica-guide` 只负责介绍、引导、配置、诊断、更新与路由；日常实现仍交给稍后选择的开发 Skill。

## 三类版本身份

Guide 会明确区分三类相关身份：

| 身份 | 描述对象 | 何时变化 |
|---|---|---|
| **Monica 框架版本** | 项目使用的 NuGet 或源码版本 | 项目修改 Monica 依赖时 |
| **Skill Bundle 发布版本** | 一组经过共同测试的 Monica Skill、Profile、模板与发布契约 | Monica 发布不可变框架版本时 |
| **单个 Skill Revision** | Catalog 中类似 `r7` 的易读计数 | 发布时仅在该 Skill 的权威内容 Digest 发生变化时 |

Catalog 中的 SHA-256 Digest 是 Skill 精确字节内容的机器身份；Revision 与 `lastChangedIn` tag 用于帮助人理解历史，不应写入可移植的 `SKILL.md` frontmatter。

日常 CI 只验证 Schema、确定性投影、依赖闭包、Prompt 一致性与 Revision 记账，**不会**发布用户可见的 Skill 更新。只有 Monica Release Workflow 会发布不可变的 Catalog 与 Prompt 资产、递增发生变化的 Skill Revision，并在不可变源、安装与发现 Smoke Test 通过后移动 `stable` 或 `preview` 指针。

## 通道与精确发布版本

- `stable` 与 `preview` 指向经过测试的不可变 Monica tag。
- 显式 `--release-tag` 会选择该精确发布版本，并从它推导通道；显式提供的通道只是断言，必须与发布版本一致。
- `source` 绑定显式选择的 commit，绝不会跟随移动分支。
- 离线操作只使用已验证的缓存契约与源码。Guide 不会替换为其他发布版本或默认分支。

Monica Skill 采用全局安装，因此每个用户同时只有一个激活的 Skill Bundle 发布版本。仓库在 `.monica/guide.json` 中记录期望版本；若当前全局版本不同，`doctor` 会报告冲突，并要求显式切换全局版本或升级仓库。Guide 不会声称支持全局多版本并存隔离。

## Status、Doctor 与 Update

不带工作区运行 `status`，可快速查看当前激活的全局发布版本、已安装 Skill，以及所有 Monica 或 Monica.Docs 源码绑定。添加工作区后，还可查看检测到的 Profile、期望发布版本、已选能力与托管指令。使用 `doctor` 获取全局或工作区的可执行检查结果。两者都支持供自动化使用的 `--json`。

任何包含源码绑定或本地路径的 Guide 输出——包括 `overview`、`source list`、`source resolve`、`status` 与 `doctor` JSON——都可能含有私有的绝对路径。请将其保留在本机，默认不要提交或分享。

初始化后、变更发布版本或源码绑定后，以及 Skill 发现或托管指令疑似过期时，应运行 `doctor`。选定仓库之前就可以检查全局健康状态。稍后配置新工作区时，Guide 会先解释 Profile 选项，只有在你选择后才生成 `init` 预览。

`update` 默认同样是 Dry run。预览会比较已安装和目标 Revision 与 Digest。Guide 只重新安装新增、变化、缺失、未知或被篡改的 Monica Skill，不会触碰无关的用户 Skill。`update --skill <name>` 仍会纳入必需依赖；它要么生成一致的发布依赖闭包，要么拒绝形成混合全局版本。

## Plan Digest 与受保护执行

所有修改型 Intent——`init`、`update`、`configure`、`source`、`contribute` 与 `forget`——都会在应用前预览操作与文件 Diff。生成的 `planDigest` 覆盖计划及相关工作区观察值。应用时必须传入 `--apply --plan-digest <digest>`；发生漂移后会失败。

当计划修改全局 Skill 时，Guide 会在同一个补偿边界中保护所选 Monica Skill 与计划文件。如果操作失败，它只恢复已经尝试的工作，并验证可观察结果。中断、未完成或等待清理的恢复证据会出现在 `status` 与 `doctor` 中，并在核对前阻止下一次修改。

## 源码绑定

源码绑定是以规范仓库为键的全局用户资源。Monica 与 Monica.Docs 可以分别拥有一个激活的精确绑定，也可以只存在其中一个或两个都不存在。绑定会记录经验证的 ref、commit、来源与本地路径；`status` 还会显示兼容性检查结果，便于 Agent 在任务需要框架或文档内部实现时重用源码。

源码绑定与工作区初始化是两个独立操作。Profile 可以根据特定任务推荐或要求某个仓库，但源码仍然全局可用，不归 Profile 所有。Guide 通过 `inspect-dependency-source` 的稳定 `resolve --json` 契约解析精确源码，或验证显式提供的 Checkout。Catalog 管理的源码绝不会被修改；离线模式要求精确的已验证源码已经可用。

对于普通查找，即使 Checkout 为 Dirty 或版本不匹配，`source resolve` 仍会返回可用路径，并显示醒目警告。只有要求精确一致的操作——Profile 前置条件、离线或 Source Channel 安装，以及精确依赖声明——才会因这些检查结果而阻塞。

工作区需要兼容 Monica 版本时，Guide 依次从 `ProjectReference`、lock/assets 数据、中央包管理与项目声明解析。混合版本、无法解析的范围、不可用的不可变发布版本，以及无法识别有效 commit 的源码 Checkout 都会 Fail closed。

## 托管指令与状态

Guide 只管理根 `AGENTS.md` 中自己的标记区块。它会保留周围内容；遇到损坏、重复或嵌套区块时只进行诊断，不会隐式重写。对于 Claude Code，它可以维护一个仅导入 `@AGENTS.md` 的最小根 `CLAUDE.md`。

状态会明确拆分：

- `.monica/guide.json` 保存仓库共享选择，例如 Profile、通道、已选能力、期望发布版本与指令区块版本。
- 平台标准位置中的用户 `state.json` 保存激活的全局版本、Agent 目标、以仓库为键的 Monica 与 Monica.Docs 源码绑定、偏好与带时间戳的观察记录。

用户本地路径不应进入仓库状态。状态变更使用 Schema Migration、锁与原子替换。`forget` 只移除工作区自有的 Guide 配置、偏好与托管指令所有权，绝不会移除 Monica 或 Monica.Docs 的全局源码绑定。

## 贡献者仓库

只有在可写的规范 Monica Checkout 中工作时才选择 `framework-contributor`。在可写 Monica.Docs Checkout 中工作时选择 `docs-contributor`；它对精确 Monica 源码的要求可重用已有的全局 Monica 绑定。即使绑定指向可写 Checkout，Guide 也只将其用于查找；跨仓库编辑必须在当前会话中获得单独、明确的授权。应用与扩展开发者在需要文档实现或示例时，也可绑定 Monica.Docs。

`monica-contribution` 可以分类发现、准备复现、搜索重复项，并起草 Issue、Discussion 或 Pull Request 内容。可持久化的偏好仅限 `never`、`prepare` 与 `ask`。创建分支、Push、发布 Draft Pull Request 或远程创建 Issue/PR 始终需要当前会话授权。疑似漏洞必须通过私密安全渠道处理，绝不能成为公开 Issue。

## 运维检查清单

1. 使用全局 `status` 查看激活发布版本、已安装 Skill 与 Monica/Monica.Docs 绑定。
2. 只有需要 Profile、版本兼容性或托管指令检查时才添加工作区。
3. 预览 `update` 或任何源码变更，审核 Revision、路径、ref 或 commit、来源、兼容性警告、文件与 Digest。
4. 只使用对应 Digest 应用未变化的计划，然后运行 `doctor`。
5. 托管指令文件变化后，开始一次新的 Agent 运行。
