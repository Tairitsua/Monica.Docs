---
title: Module 模式与主机边界
description: 理解 Monica 如何为每个宿主记录、校验并应用一份显式模块图。
sidebar_position: 1
---

`builder.AddMonica(monica => ...)` 拥有一份独立的 Monica 应用上下文。回调中的 Option、Guide、依赖边、运行时目录和诊断快照都属于当前宿主。

## 生命周期

1. 回调记录应用配置、类型发现范围、模块与 Guide 选择。
2. 模块把自己的依赖加入同一张图。
3. Monica 校验必需 Guide 配置并拒绝依赖环。
4. 模块按确定顺序串行完成配置与服务注册阶段。模块可以调度隔离的 CPU 密集型工作，同时让串行组合线程继续执行其他回调。
5. Monica 会在每个组合检查点等待已到声明截止点的工作，并在 `AddMonica(...)` 返回前的最终检查点排空全部剩余工作。
6. Generic Host 在服务注册与全部调度的组合工作完成后结束 Monica 组合。
7. Web Host 在构建后通过 `UseMonica()` 应用中间件，再通过 `MapMonica()` 映射端点并完成组合。

回调结束后模块图会被封闭。不要保留 `ModuleGuide` 并尝试在之后继续修改它。

Web Host 必须在同一个 `WebApplication` 实例上依次调用一次 `UseMonica()` 和一次 `MapMonica()`。如果两者缺失、顺序错误、重复调用或使用了不同的应用实例，Monica 会拒绝该组合；尚未完成组合的 Web Host 会在任何 Hosted lifecycle 参与者运行前启动失败。Generic Host 不调用这两个方法，只能组合支持非 Web 运行或允许降级的模块。

## 调度组合工作

完成物化的模块准备好不可变或由本模块独占的输入快照后，可以调用受保护方法 `ModuleBase.ScheduleCompositionWork(string name, Action work, ModuleCompositionWorkDeadline deadline = BeforeServiceRegistrationCompletion)`。调度只能在该模块的 `ConfigureBuilder`、`ConfigureServices` 或 `PostConfigureServices` 回调执行期间，由同一回调线程同步发起。Monica 通过有界 Worker Pool 启动符合条件的工作，同时让串行组合线程继续执行其他模块回调。

Deadline 表示工作最晚必须完成的组合检查点，不是超时设置：

| Deadline | 必须完成的检查点 |
|---|---|
| `BeforeBusinessTypeIteration` | Monica 开始遍历已发现业务类型之前。 |
| `BeforePostConfigureServices` | 任一 `PostConfigureServices` 回调开始之前。 |
| `BeforeServiceRegistrationCompletion` | 服务注册完成且 `AddMonica(...)` 返回之前。这是默认值。 |

所有调度工作都是必需工作。Monica 会在声明的检查点等待，在继续组合前传播失败，并且绝不会让组合工作晚于 `AddMonica(...)` 结束。这个 API 不会让 `ConfigureServices`、`PostConfigureServices` 或其他模块回调并发执行。

工作 Action 必须同步、具有确定性、CPU 密集且保持隔离；Monica 会拒绝 `async`/`async void` 委托，也不会把调用方的环境 `ExecutionContext` 传入 Worker，请显式捕获所需的模块自有值。它不得修改宿主 Builder、`IServiceCollection`、模块图、Service Provider 或共享静态状态，也不得依赖其他工作项的完成顺序。调度由 Monica 负责；模块作者不应再增加 `Task.Run`、`Task.WhenAll` 或 Fire-and-forget 工作。

运行时激活、I/O、长时间任务与清理应使用标准 `IHostedLifecycleService` 或 Hosted Service。调度组合工作只处理构建前必需的计算，例如编译已经准备完毕的模块自有映射目录。

## 公开部件

| 部件 | 职责 |
|---|---|
| `builder.AddMonica(...)` | 创建当前宿主的 Monica 组合边界。 |
| `monica.Add{Name}()` | 把模块加入当前宿主图。 |
| `Module{Name}Option` | 配置当前宿主拥有的行为与默认值。 |
| `Module{Name}Guide` | 选择 Provider 或可选能力。 |
| `ModuleBase.ScheduleCompositionWork(...)` | 使用显式组合 Deadline 调度必需、隔离的 CPU 密集型工作。 |
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

`Monica.Core` 还提供统一的类型化执行管线。Mediator、MVC、EventBus、JobScheduler、Seeder 与 Hosted work item 分别通过模块自己的适配器进入管线；ProjectUnit 角色本身不会触发运行时拦截。完整边界与事务策略见[执行边界](./execution-boundaries.md)和 [Execution Pipeline 模块](../modules/execution-pipeline/index.md)。

## 为什么边界重要

- 两个测试宿主不会覆盖彼此的模块 Option。
- 无效模块图会在应用开始服务前失败。
- 诊断信息描述正在检查的宿主，而不是进程级近似状态。
- 编码 Agent 只需查看一个组合根，就能发现应用启用了哪些能力。

## 下一步

- [Option 与 Guide](./configuration-and-guide.md)
- [执行边界](./execution-boundaries.md)
- [项目单元编写](./project-unit-authoring.md)
- [测试 Monica 应用](../guides/testing-monica-applications.md)
- [模块文档目录](../modules/index.md)
