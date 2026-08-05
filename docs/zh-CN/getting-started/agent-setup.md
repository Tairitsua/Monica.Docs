---
title: Agent 设置
description: 安装 Monica Guide，选择开发 Profile，并安全预览仓库级初始化。
sidebar_position: 2
---

# 为编码 Agent 设置 Monica

`monica-guide` 是 Monica Agent 辅助开发的统一入口。它会为当前仓库选择匹配的 Monica 开发 Skill，把这些 Skill 绑定到不可变的 Monica 发布版本，并在应用任何工作区变更前给出完整预览。Monica Skill 遵循可移植的 [Agent Skills 规范](https://agentskills.io/specification)及其 Progressive disclosure 模型。

## 从官网 Prompt 开始

打开首页的 [Agent setup 起步区](/zh-CN/#start)，选择 **Codex** 或 **Claude Code**，再复制对应 Prompt。该 Prompt 只会从官网公布的不可变 Monica tag 安装 `monica-guide`，验证宿主是否已经发现它，并在预览初始化前把同一个 tag 作为 `--release-tag` 交给 Guide。

每个宿主 Prompt 还会显式传入匹配的 `--agent` 目标，因此仅设置 Codex 时不会悄悄安装 Claude Code 绑定，反之亦然；通用 fallback 会显式选择两个目标。

通常不需要为了发现 Skill 而重启：

- [Codex 会发现 Skill](https://learn.chatgpt.com/docs/build-skills) 目录中的新内容。只有 `monica-guide` 没有出现时才重启。Codex 在一次运行开始时读取 `AGENTS.md`，因此应用新的托管指令块后，需要重新开始一次运行。
- [Claude Code 会监听 Skill](https://code.claude.com/docs/en/slash-commands) 目录中已存在的 `~/.claude/skills` 与项目 `.claude/skills`。只有会话开始时顶层 Skill 目录尚不存在，才需要重启。[`CLAUDE.md` 与相对 import](https://code.claude.com/docs/en/memory) 在会话开始时加载。

## 选择 Profile

Guide 可以根据仓库身份与特征文件建议 Profile，但在你确认前不会安装 Skill 或修改文件。

| Profile | 适用场景 | Monica 源码策略 |
|---|---|---|
| `application` | 消费 Monica 包的应用 | 精确只读源码可选；行为依赖框架内部实现时建议绑定 |
| `extension-author` | 独立 Monica 模块、Provider、UI 包与配套镜像 | 必须绑定精确只读 Monica 源码；生成项目仍只通过 NuGet 消费 Monica |
| `framework-contributor` | 修改 Monica 框架仓库 | 必须使用可写 Monica checkout |
| `docs-contributor` | Monica.Docs 内容、官网与示例应用 | 必须使用可写 Monica.Docs 与精确只读 Monica 源码；写入 Monica 需要单独授权 |

对于模糊、混合或非 Monica 仓库，Guide 会把 Profile 留给用户选择，不会根据薄弱证据猜测。

## 先预览，再应用

让 Guide 初始化仓库并展示计划：

```text
$monica-guide 初始化这个仓库。解释检测到的 Profile，并在应用前预览全部操作。
```

`init`、`update`、`configure`、`source`、`contribute` 与 `forget` 等会修改状态的 intent 默认都是 dry run。预览包含完整操作清单、文件 diff 与 `planDigest`。真正应用时必须同时提供 `--apply` 与该 digest；如果预览后工作区或计划发生变化，Guide 会中止。

对于需要安装全局 Skill 的计划，Guide 会在同一个补偿边界内保护选中的 Monica Skill 与全部计划文件。任一受保护操作失败时，只恢复已经尝试的工作并验证结果。中断、补偿不完整或清理待完成的私有恢复证据会出现在 `status` 与 `doctor` 中，并阻止下一次修改，直到完成核对。底层 CLI 不公开每个 Agent 的 copy/symlink 拓扑，因此 Guide 验证规范路径内容、权限、成员关系与来源，而不会声称隐藏拓扑具备原子性。

使用 `status` 查看当前绑定，使用 `doctor` 获取可执行诊断；两者都支持可读输出与自动化所需的 `--json`：

```text
$monica-guide 运行 doctor --json，并在修改任何文件前解释所有阻塞项。
```

## 发布通道与全局版本行为

- `stable` 与 `preview` 通过 Monica Skill index 解析到不可变 Monica tag 与已验证 catalog digest。
- `source` 绑定显式选择的 commit，绝不会跟随移动分支。
- 离线时只使用已经验证的缓存 catalog 与源码。所需产物不可用时，Guide 不会改用其他发布版本或默认分支。

Monica Skill 采用全局安装，因此每个用户同时只有一个激活的 Monica Skill 发布版本。仓库在 `.monica/guide.json` 中记录期望版本。如果它与当前全局版本不同，`doctor` 会报告冲突，并要求显式切换全局版本或升级仓库；系统不会声称支持全局多版本并存隔离。

## 源码绑定

Guide 依次从 `ProjectReference`、lock/assets 数据、中央包管理和项目声明解析框架版本。混合版本、无法解析的范围、缺失的不可变发布版本，以及无法确认 commit 的脏源码 checkout 都会 Fail closed。

精确源码通过 `inspect-dependency-source` 解析。绑定记录经过验证的 ref、commit、来源、访问模式与本地路径；Guide 绝不会修改 catalog 管理的源码。

## 托管指令与状态

Guide 只管理根 `AGENTS.md` 中带标记的区块，周围原有指令保持不变。标记损坏、重复或嵌套时只诊断，不擅自重写。对 Claude Code，Guide 可以维护一个只导入 `@AGENTS.md` 的最小根 `CLAUDE.md`。

状态被明确拆分：

- `.monica/guide.json` 是仓库共享配置，包含 Profile、通道、已选能力、期望 catalog 发布版本与托管指令版本。
- 平台标准位置中的用户 `state.json` 保存激活的全局发布版本、Agent 目标、已验证源码绑定与用户偏好；带时间戳的观察记录与偏好分开保存。

状态更新使用 schema migration、锁与原子替换。`forget` 会先预览将移除的 Guide 自有项目状态或用户状态。

仓库共享文件有意排除用户本地源码路径。用户状态可能包含本地路径、来源与带时间戳的观察记录，因此它保留在平台标准的用户位置，而不会进入仓库。请像审查其他提交配置一样审查 `.monica/guide.json`。

## 贡献安全

`monica-contribution` 负责问题分类、复现、重复项搜索，以及 Issue、Discussion 或 PR 草稿准备。它只持久化 `never`、`prepare` 或 `ask` 三种贡献偏好。

远程创建 Issue/PR、创建分支、Push 与发布 Draft PR 始终需要当前会话授权。疑似安全漏洞必须走私密渠道，绝不能创建公开 Issue。

## 下一步

- 切换 Monica 发布版本或源码绑定后运行 `doctor`。
- 使用 `update` 预览 catalog 选择的 Skill 更新；不会触碰无关的用户 Skill。
- 日常开发继续交给 Profile 选择的 `monica-application`、`monica-framework` 与细粒度 Skill；Guide 只负责引导、配置、诊断与路由。
- 如果要手动组合宿主，请继续阅读[快速开始](./index.md)。
