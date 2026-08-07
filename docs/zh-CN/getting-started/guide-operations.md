---
title: Guide 运维与安全
description: 了解 Monica Guide 的发布、更新、源码绑定、托管状态、恢复机制与贡献安全边界。
sidebar_position: 3
---

完成首次 [Agent 设置](./agent-setup.md)后、维护已有设置时，或在 Monica 贡献仓库中工作时，请使用本页。`monica-guide` 只负责引导、配置、诊断、更新与路由；日常实现仍交给仓库所选的开发 Skill。

## 三类版本身份

Guide 会明确区分三类相关身份：

| 身份 | 描述对象 | 何时变化 |
|---|---|---|
| **Monica 框架版本** | 项目使用的 NuGet 或源码版本 | 项目修改 Monica 依赖时 |
| **Skill Bundle 发布版本** | 一组经过共同测试的 Monica Skill、Profile、模板与发布契约 | Monica 发布不可变框架版本时 |
| **单个 Skill Revision** | Catalog 中类似 `r7` 的易读计数 | 发布时仅在该 Skill 的权威内容 Digest 发生变化时 |

Catalog 中的 SHA-256 Digest 是 Skill 精确字节内容的机器身份；Revision 与 `lastChangedIn` tag 用于帮助人理解历史，不应写入可移植的 `SKILL.md` frontmatter。

日常 CI 只验证 Schema、确定性投影、依赖闭包、Prompt 一致性与 Revision 记账，**不会**发布用户可见的 Skill 更新。只有 Monica Release Workflow 会发布不可变的 Catalog 与 Prompt 资产、递增发生变化的 Skill Revision，并在安装、发现与初始化 Smoke Test 通过后移动 `stable` 或 `preview` 指针。

## 通道与精确发布版本

- `stable` 与 `preview` 指向经过测试的不可变 Monica tag。
- 显式 `--release-tag` 会选择该精确发布版本，并从它推导通道；显式提供的通道只是断言，必须与发布版本一致。
- `source` 绑定显式选择的 commit，绝不会跟随移动分支。
- 离线操作只使用已验证的缓存契约与源码。Guide 不会替换为其他发布版本或默认分支。

Monica Skill 采用全局安装，因此每个用户同时只有一个激活的 Skill Bundle 发布版本。仓库在 `.monica/guide.json` 中记录期望版本；若当前全局版本不同，`doctor` 会报告冲突，并要求显式切换全局版本或升级仓库。Guide 不会声称支持全局多版本并存隔离。

## Status、Doctor 与 Update

使用 `status` 快速查看仓库 Profile、期望发布版本、当前全局版本、已选 Skill 与源码绑定；使用 `doctor` 获取可执行的检查结果。两者都支持供自动化使用的 `--json`。

初始化后、变更发布版本或源码绑定后，以及 Skill 发现或托管指令疑似过期时，应运行 `doctor`。全新且尚未配置的仓库应先生成 `init` 预览，不需要把 `doctor` 当成前置步骤。

`update` 默认同样是 Dry run。预览会比较已安装和目标 Revision 与 Digest。Guide 只重新安装新增、变化、缺失、未知或被篡改的 Monica Skill，不会触碰无关的用户 Skill。`update --skill <name>` 仍会纳入必需依赖；它要么生成一致的发布依赖闭包，要么拒绝形成混合全局版本。

## Plan Digest 与受保护执行

所有修改型 Intent——`init`、`update`、`configure`、`source`、`contribute` 与 `forget`——都会在应用前预览操作与文件 Diff。生成的 `planDigest` 覆盖计划及相关工作区观察值。应用时必须传入 `--apply --plan-digest <digest>`；发生漂移后会失败。

当计划修改全局 Skill 时，Guide 会在同一个补偿边界中保护所选 Monica Skill 与计划文件。如果操作失败，它只恢复已经尝试的工作，并验证可观察结果。中断、未完成或等待清理的恢复证据会出现在 `status` 与 `doctor` 中，并在核对前阻止下一次修改。

## 源码绑定

Guide 依次从 `ProjectReference`、lock/assets 数据、中央包管理与项目声明解析 Monica 版本。混合版本、无法解析的范围、不可用的不可变发布版本，以及无法识别有效 commit 的源码 Checkout 都会 Fail closed。

要求精确源码的 Profile 通过 `inspect-dependency-source` 的稳定 `resolve --json` 契约解析源码。绑定会记录经过验证的 ref、commit、来源、访问模式与本地路径。Catalog 管理的源码绝不会被修改；离线模式要求精确的已验证源码已经可用。

## 托管指令与状态

Guide 只管理根 `AGENTS.md` 中自己的标记区块。它会保留周围内容；遇到损坏、重复或嵌套区块时只进行诊断，不会隐式重写。对于 Claude Code，它可以维护一个仅导入 `@AGENTS.md` 的最小根 `CLAUDE.md`。

状态会明确拆分：

- `.monica/guide.json` 保存仓库共享选择，例如 Profile、通道、已选能力、期望发布版本与指令区块版本。
- 平台标准位置中的用户 `state.json` 保存激活的全局版本、Agent 目标、本地源码绑定、偏好与带时间戳的观察记录。

用户本地路径不应进入仓库状态。状态变更使用 Schema Migration、锁与原子替换。`forget` 会准确预览将删除的 Guide 自有项目状态或用户状态。

## 贡献者仓库

仅在可写的规范 Monica Checkout 中使用 `framework-contributor`。在可写的 Monica.Docs Checkout 中使用 `docs-contributor`，并绑定精确的只读 Monica 源码；如需跨仓库修复，对 Monica 的写入权限仍需单独决定。

`monica-contribution` 可以分类发现、准备复现、搜索重复项，并起草 Issue、Discussion 或 Pull Request 内容。可持久化的偏好仅限 `never`、`prepare` 与 `ask`。创建分支、Push、发布 Draft Pull Request 或远程创建 Issue/PR 始终需要当前会话授权。疑似漏洞必须通过私密安全渠道处理，绝不能成为公开 Issue。

## 运维检查清单

1. 使用 `status` 确认仓库与当前全局发布版本一致。
2. 预览 `update`，审核变化的 Revision、依赖闭包、文件与 Digest。
3. 只使用对应 Digest 应用未变化的计划。
4. 运行 `doctor`；在日常开发前解决恢复或源码问题。
5. 托管指令文件变化后，开始一次新的 Agent 运行。
