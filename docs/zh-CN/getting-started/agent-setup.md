---
title: Agent 设置
description: 安装 Monica Guide，并为应用、扩展或框架工作区选择 Skill。
sidebar_position: 2
---

`monica-guide` 是面向编码 Agent 的 Monica 设置工具箱，用于安装和更新 Agent Skills；它与应用使用的 .NET 运行时包相互独立。

## 从发布版安装

打开首页的 [Agent 设置起步区](/zh-CN/#start)，将其中的指令粘贴到兼容 Agent Skills 的编码 Agent。安装过程会选择适合当前平台的发布包，并对照 `SHA256SUMS` 校验。Agent 找到 `Monica.Guide` 可执行文件后，会预览工作区设置；你选定 Profile 后，它使用计划摘要应用变更，再通过 `status` 或 `doctor` 检查结果。

Guide 可以先介绍工具箱、检查安装状态，不需要初始化仓库。默认将 Skill 安装到项目中；整机安装需要明确选择。Guide Skill 本身可根据产品偏好保留在全局，供多个项目使用。

## 选择工作区 Profile

| Profile | 适用工作 |
| --- | --- |
| `application` | 基于 Monica 的应用。选择 `microservice` 或 `modular-monolith` 之一；需要 UI 时再加入 `ui`。 |
| `extension-author` | 独立发布的 Monica 模块或 Provider。 |
| `framework-contributor` | Monica 框架的规范 Checkout。 |

Profile 决定经过同一发布版本验证的 Skill 集合。Guide 的工作区检测仅提供建议，应按实际任务选择。Monica.Docs 是普通文档仓库，没有 Guide 专属的文档 Profile 或源码绑定。直接使用其 Checkout 和仓库指令；只有需要查看精确的 Monica 框架实现时，才使用框架源码绑定。

## 审核并验证

Guide 的修改型命令先生成带 `planDigest` 的预览。使用 `--apply --plan-digest <digest>` 应用未变化的计划，然后运行 `doctor --workspace <path>`。如果托管的 `AGENTS.md` 或 `CLAUDE.md` 发生变化，应开始新的 Agent 运行，以重新加载指令。

发布更新、源码查找、恢复与贡献控制见 [Guide 运维与安全](./guide-operations.md)。
