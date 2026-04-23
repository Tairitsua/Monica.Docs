---
title: Scenarios
description: Configuration 的常见接入方式与使用陷阱。
sidebar_position: 5
---

# Scenarios

## 场景 1 — 用注解方式统一配置类注册

当项目中存在多个配置类型时，使用 `[Configuration]` 与 `[OptionSetting]` 可以把“绑定来源、展示标题、说明信息”一起放到配置模型上，避免宿主里堆满重复的 `Bind` 代码。

## 场景 2 — 叠加 `global-appsettings.json` 与宿主配置源

真实项目里，一个很常见的 Monica 用法是：继续使用模块默认的 `builder.Configuration`，但再通过 `SetOtherSourceAction` 叠加运行目录下的公共配置文件和宿主默认配置文件。

```csharp
using Monica.Tool.Runtime;

Mo.AddConfiguration(o =>
{
    o.GenerateFileForEachOption = true;
    o.GenerateOptionFileParentDirectory = "Configurations";
    o.SetOtherSourceAction = manager =>
    {
        manager.AddJsonFile(
            RuntimePathHelper.GetRelativePathInRunningPath("Configurations/global-appsettings.json"),
            optional: false,
            reloadOnChange: true);
        manager.AddJsonFile(
            RuntimePathHelper.GetRelativePathInRunningPath("appsettings.json"),
            optional: true,
            reloadOnChange: true);
    };
});
```

## 场景 3 — 在注册阶段就读取 `Configuration`

如果后续注册代码就要读取 `Configuration` 项目单元或者依赖它的绑定结果，只写 `Mo.AddConfiguration()` 还不够，因为模块通常会在后续统一注册。

这时应当在 `Mo.AddConfiguration()` 之后立即调用 `Mo.RegisterInstantly(builder)`：

```csharp
Mo.AddConfiguration();

Mo.RegisterInstantly(builder);

// 这里之后的注册代码，才可以安全消费已经绑定的配置类型。
```

这个模式适合日志初始化、外部客户端注册、基础设施引导等“注册阶段就要消费配置”的场景。若配置只在运行期通过 `IOptions<T>`、`IOptionsSnapshot<T>` 或 `IOptionsMonitor<T>` 使用，则不需要额外调用 `Mo.RegisterInstantly(builder)`。

## 场景 4 — 替换历史存储以支持回滚审计

如果你打算开放配置修改与回滚能力，建议尽早把默认内存历史存储替换为自定义实现，这样重启后仍能保留完整历史记录。

## Common mistakes

- 把旧文档里的配置注册方式照搬到新架构；当前统一入口是 `Mo.AddConfiguration()`。
- 需要在注册阶段使用配置，却没有在 `Mo.AddConfiguration()` 后立刻调用 `Mo.RegisterInstantly(builder)`。
- 只有普通运行期 `IOptions<T>` 注入需求，却过早调用 `Mo.RegisterInstantly(builder)`，让注册顺序变复杂。
