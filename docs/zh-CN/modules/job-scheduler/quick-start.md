---
title: Quick Start
description: 安装并注册 JobScheduler。
sidebar_position: 2
---

## 安装包

```bash
dotnet add package Monica.JobScheduler --prerelease
```

## 注册两个必需选择

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.JobScheduler.Abstractions;
using Monica.JobScheduler.Annotations;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddJobScheduler(options =>
        {
            options.MaxWorkerExecutionThreads = 4;
        })
        .UseInMemoryStore()
        .UseSchedulerScope("local-dev");
});

[JobConfig(JobName = "Ping job", CronSchedule = "0 */5 * * * *")]
public sealed class PingJob(ILogger<PingJob> logger) : RecurringJob(logger)
{
    public override Task ExecuteAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation("Ping");
        return Task.CompletedTask;
    }
}
```

JobScheduler 始终要求统一存储与调度作用域，缺一会在启动时被模块校验拒绝。内存存储面向本地或单进程场景；它不跨越进程重启，也无法协调多个宿主。

宿主自动从 `ProjectName`（或应用级项目名，回退到入口程序集名）解析所有者键，从 `HOSTNAME` 环境变量（否则 `machine:pid`）解析工作实例标识。两者直接驱动作业发现、快照发布与租约 fencing。

## 第一个有价值的配置

两个设置覆盖绝大多数真实调整：

```csharp
monica.AddJobScheduler(options =>
    {
        options.CronTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Shanghai");
        options.RecurringJobDebugMode = builder.Environment.IsDevelopment();
    })
```

`CronTimeZone` 统一各宿主的 Cron 解释（持久化的执行时点始终换算为 UTC）；`RecurringJobDebugMode` 在开发期抑制自动物化，但立即执行与触发式作业不受影响。

## 接下来读什么

- [目录与生命周期](./catalog-lifecycle.md)
- [Configuration](./configuration.md)
- [注册与提供程序](./guide-and-providers.md)
- [Scenarios](./scenarios.md)
