---
title: Guide 运维与安全
description: 管理 Monica Skill 安装、精确发布版本、框架源码查找与工作区状态。
sidebar_position: 3
---

完成 [Agent 设置](./agent-setup.md) 后，可用 Monica Guide 检查或更新工作区的 Skill 安装。可执行文件负责实际设置行为；`monica-guide` Skill 解释命令，并把开发任务交给对应的 Skill。

## 检查状态

`overview` 介绍已安装产品和后续操作。`workspaces` 列出已初始化工作区。`status` 检查 Skill 投影；加入 `--workspace <path>` 可检查 Profile 与托管指令。`doctor` 还会执行更深入的运行时检查。这些命令支持机器可读的 `--json` 输出。

Guide 为每个产品记录一个激活的 Skill 发布版本，并依据该版本的 Catalog Digest 校验已安装的 Skill 目录。工作区 Profile 选择安装在项目中的 Skill 集合。发布资产不可变；离线时只使用已安装的 Bundle 和已验证的本地状态，不用移动分支或其他发布版替代。

## 预览变更

`init --workspace <path> --profile <name>` 记录工作区 Profile，并创建托管指令区块。`configure --workspace <path>` 在项目配置的 Skill 目录中安装或更新对应集合。`unconfigure --workspace <path>` 移除该工作区由 Guide 安装的 Skill；`forget --workspace <path>` 移除 Guide 管理的工作区配置与指令区块。全局 `configure` 仅用于明确选择的整机安装。

每个修改型命令都先生成计划。只用 `--apply --plan-digest <digest>` 应用已审阅的计划；Guide 会拒绝漂移并校验结果。托管 `AGENTS.md` 变化后应开始新的 Agent 运行。其他 Skill 与 Guide 管理区块之外的仓库指令保持独立。

## 查找框架源码

`source resolve --repository monica --json` 查看已验证的 Monica 框架 Checkout 绑定，包括 ref、commit、路径、来源与警告。普通查找仍可返回 Dirty 或已移动的 Checkout，同时给出警告。通过命令的预览与应用流程绑定明确提供的规范 Checkout。源码绑定只用于查找，不改变项目依赖，也不授权编辑。

Monica.Docs 没有 Guide 源码绑定，也没有 `docs-contributor` Profile。根据当前任务或普通文件系统查找其 Checkout。人类阅读的文档维护在该仓库的 `docs/` 中；规范 Agent Skills 仍维护在 Monica 的 `skills/` 中。

## 贡献与本地路径

Guide 的 `issue status` 显示本机 Issue 准备偏好；该偏好不授权远程变更。贡献工作使用 `$monica-contribution`，疑似安全漏洞走私密报告渠道。

Guide 的 JSON 输出可能含有私有绝对路径。除非任务明确需要分享，否则应留在本机。如果计划、安装或托管指令疑似过期，先运行 `doctor` 再继续修改。
