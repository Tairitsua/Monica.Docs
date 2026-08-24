---
title: 运维 UI 工作台
description: JobScheduler UI 的页面、访问控制与选项。
sidebar_position: 7
---

`Monica.JobScheduler.UI` 提供本地化的调度运维工作台，页面注册在任务调度（Task Scheduling）导航分类下，全部文案经 `JobSchedulerResource` 本地化。

```bash
dotnet add package Monica.JobScheduler.UI --prerelease
```

```csharp
monica.AddJobSchedulerUI();
```

UI 模块依赖 `ModuleJobScheduler`、本地化模块与 Shell UI；访问控制复用运维页面的统一策略（见下文）。

## 页面

| 页面 | 路由 | 覆盖能力 |
|---|---|---|
| 总览 | `/job-scheduler` | 发布就绪度、目录发布状态、owner 收敛、工作负载与待关注项、最近执行。 |
| 目录 | `/job-scheduler/catalog` | 激活目录的运维表格：筛选、调度描述、策略审阅状态；支持触发、立即执行与策略编辑。 |
| 作业详情 | `/job-scheduler/catalog/{JobKey}` | 单个作业的声明契约、调度面板、最新执行与活动面板（不在导航中显示）。 |
| 执行 | `/job-scheduler/executions` | 持久化执行的分页查询、状态流、执行详情（证据事实与追加式历史台账）、取消。 |
| 统计 | `/job-scheduler/statistics` | 分析仪表盘：进入队列的执行队列、完成可靠性、重复计划履约、时长百分位、趋势、排行与最慢执行。 |

总览按 `AutoRefreshInterval` 自动刷新；目录与执行页默认分页大小由 `DefaultPageSize` 控制。

## 访问控制

所有页面与变更操作都由 `OperationalPageAccessPolicy<ModuleJobSchedulerUIOption>` 保护：

- 设置了 `AuthorizationPolicyOverride` 时，用它覆盖 Shell 级运维策略。
- 未设置时继承 Shell 运维策略。
- **非 Development 环境下，没有任何生效策略时拒绝访问**——生产部署必须显式配置授权策略。

## Module options

| Property | Type | Default | When to change |
|---|---|---|---|
| `AuthorizationPolicyOverride` | `string?` | `null` | 你要为调度运维页单独指定授权策略时。 |
| `AutoRefreshInterval` | `TimeSpan` | `5s` | 调整总览自动刷新节奏时。 |
| `DefaultPageSize` | `int` | `20` | 调整目录与执行页默认分页大小时。 |

## 相关页面

- [目录发布与生命周期](./catalog-lifecycle.md)
- [注册扩展与角色](./guide-and-providers.md)
