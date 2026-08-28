---
title: 运维 UI 工作台
description: JobScheduler UI 的页面、运行时洞察、访问控制与选项。
sidebar_position: 7
---

`Monica.JobScheduler.UI` 提供本地化的调度运维工作台，页面注册在任务调度（Task Scheduling）导航分类下，全部文案经 `JobSchedulerResource` 本地化。

```bash
dotnet add package Monica.JobScheduler.UI --prerelease
```

```csharp
monica.AddJobSchedulerUI();
```

UI 模块依赖 `ModuleJobScheduler`、本地化模块与 Shell UI；访问控制复用共享的运维页策略（见下）。作用域内任一服务都可以添加它——每个宿主看到的都是同一个共享存储视图。

## 页面

| 页面 | 路由 | 覆盖内容 |
|---|---|---|
| 总览 | `/job-scheduler` | 工作负载 KPI（总数、运行中、成功率、24 小时吞吐）、执行状态分布、最近队列活动与关注信号。 |
| 目录 | `/job-scheduler/catalog` | 所有所有者定义的运维表格：筛选、调度说明、下次/上次执行；标题链接到作业档案，作业键点击复制，行内提供立即执行、暂停/恢复与策略编辑。 |
| 作业详情 | `/job-scheduler/catalog/{OwnerKey}/{JobKey}` | 单个作业的声明契约、调度面板、最近执行与活动（不在导航中显示）。 |
| 执行实例 | `/job-scheduler/executions` | 分页的持久化执行查询与状态筛选；行标题与详情操作打开执行证据、只追加的历史账本与取消。 |
| 统计分析 | `/job-scheduler/statistics` | 分析看板：完成可靠率、耗时分位数、结果趋势、排行与最慢执行，按有界时间范围。 |
| 运行时 | `/job-scheduler/runtime` | 当前宿主身份与生效配置、存储类型/提供程序、本机调度面就绪状态、各所有者足迹与在线徽章，以及启用洞察后的 worker 实例。 |

总览按 `AutoRefreshInterval` 自动刷新；目录与执行实例页使用 `DefaultPageSize` 作为默认页大小。

## Worker 实例洞察

运行时页的 worker 表需要一个洞察提供程序。注册 ServiceDiscovery 集成即可填充：

```csharp
monica.AddJobSchedulerServiceDiscoveryInsight();
```

该集成要求 `AddServiceDiscovery(...)` 使用共享存储（跨服务 `UseDistributedStorage()`，单宿主 `UseMemoryStorage()`）。未注册时，运行时页显示引导提示而不是空表。

## 访问控制

每个页面与变更操作都由 `OperationalPageAccessPolicy<ModuleJobSchedulerUIOption>` 保护：

- 设置 `AuthorizationPolicyOverride` 时，覆盖 Shell 级运维策略。
- 未设置时继承 Shell 运维策略。
- **Development 环境之外，缺失有效策略即拒绝访问**——生产部署必须显式配置授权策略。

## 模块选项

| 属性 | 类型 | 默认值 | 何时调整 |
|---|---|---|---|
| `AuthorizationPolicyOverride` | `string?` | `null` | 为调度页面指定独立授权策略。 |
| `AutoRefreshInterval` | `TimeSpan` | `5s` | 调整总览自动刷新节奏。 |
| `DefaultPageSize` | `int` | `20` | 调整目录与执行实例默认页大小。 |

## 相关页面

- [目录与生命周期](./catalog-lifecycle.md)
- [注册与提供程序](./guide-and-providers.md)
