---
title: Module 模式与主机边界
description: 理解 Monica 如何为每个宿主记录、校验并应用一份显式模块图。
sidebar_position: 1
---

# Module 模式与主机边界

`builder.AddMonica(monica => ...)` 拥有一份独立的 Monica 应用上下文。回调中的 Option、Guide、依赖边、运行时目录和诊断快照都属于当前宿主。

## 生命周期

1. 回调记录应用配置、类型发现范围、模块与 Guide 选择。
2. 模块把自己的依赖加入同一张图。
3. Monica 校验必需 Guide 配置并拒绝依赖环。
4. 模块按确定顺序完成配置与服务注册阶段。
5. Web 主机在构建后通过 `UseMonica()` 和 `MapMonica()` 应用中间件与端点。

回调结束后模块图会被封闭。不要保留 `ModuleGuide` 并尝试在之后继续修改它。

## 公开部件

| 部件 | 职责 |
|---|---|
| `builder.AddMonica(...)` | 创建当前宿主的 Monica 组合边界。 |
| `monica.Add{Name}()` | 把模块加入当前宿主图。 |
| `Module{Name}Option` | 配置当前宿主拥有的行为与默认值。 |
| `Module{Name}Guide` | 选择 Provider 或可选能力。 |
| 公开契约 | 通过 `Abstractions/`、`Models/`、`Facades/`、`Events/` 等目录提供稳定使用面。 |

## 示例

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddConfiguration()
        .UseFileConfigurationStore();

    monica.AddJobScheduler()
        .UseInMemoryMetadataRepository()
        .UseSchedulerScope("local")
        .UseInMemoryProvider();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

Provider 选择是显式契约。例如 JobScheduler 不会静默选择存储或调度 Provider；Guide 链让该决定在组合根、文档与运行时检查中保持可见。

## 为什么边界重要

- 两个测试宿主不会覆盖彼此的模块 Option。
- 无效模块图会在应用开始服务前失败。
- 诊断信息描述正在检查的宿主，而不是进程级近似状态。
- 编码 Agent 只需查看一个组合根，就能发现应用启用了哪些能力。

## 下一步

- [Option 与 Guide](./configuration-and-guide.md)
- [项目单元编写](./project-unit-authoring.md)
- [模块文档目录](../modules/index.md)
