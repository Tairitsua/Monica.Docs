---
title: 组合调试与管理能力
description: 把基础设施模块与对应 UI/诊断能力配套接起来。
sidebar_position: 2
---

# 组合调试与管理能力

Monica 的很多基础设施模块都提供了配套 UI 或诊断入口。推荐做法是：**先注册基础设施模块，再按需叠加 UI 模块**。

## 典型组合

| 基础设施模块 | 配套 UI 模块 | 作用 |
|---|---|---|
| `Configuration` | `ConfigurationUI` | 配置查看、编辑、历史回滚 |
| `DataChannel` | `DataChannelUI` | 通道状态、异常、重初始化 |
| `DependencyInjection` | `DependencyInjectionUI` | 自动注册诊断快照 |
| `EventBus` | `EventBusUI` | 事件诊断与订阅检查 |
| `JobScheduler` | `JobSchedulerUI` | 作业管理、监控、执行历史 |
| `ProjectUnits` | `ProjectUnitsUI` | 项目单元、枚举、事件结构查看 |
| `SignalR` | `SignalRUI` | Hub 元数据和连接调试 |

## 一个组合示例

```csharp
Mo.AddConfiguration(o =>
{
    o.AppConfiguration = builder.Configuration;
});
Mo.AddConfigurationUI();

Mo.AddJobScheduler()
    .UseInMemoryMetadataRepository()
    .UseSchedulerScope("local-dev")
    .UseInMemoryProvider();
Mo.AddJobSchedulerUI();
```

## 组合原则

- UI 模块不替代基础设施模块
- 先让基础模块跑通，再考虑运维界面
- 文档里优先看基础模块包，UI 模块通常只是围绕同一个能力提供可视化入口
