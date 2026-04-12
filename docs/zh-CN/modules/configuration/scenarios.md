---
title: Scenarios
description: Configuration 的常见接入方式与使用陷阱。
sidebar_position: 5
---

# Scenarios

## 场景 1 — 用注解方式统一配置类注册

当项目中存在多个配置类型时，使用 `[Configuration]` 与 `[OptionSetting]` 可以把“绑定来源、展示标题、说明信息”一起放到配置模型上，避免宿主里堆满重复的 `Bind` 代码。

## 场景 2 — 叠加 `global-appsettings.json` 与宿主配置源

真实项目里，一个很常见的 Monica 用法是：仍然把 `builder.Configuration` 作为主配置根，但再通过 `SetOtherSourceAction` 叠加运行目录下的公共配置文件和宿主默认配置文件。

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
    o.AppConfiguration = builder.Configuration;
});
```

## 场景 3 — 替换历史存储以支持回滚审计

如果你打算开放配置修改与回滚能力，建议尽早把默认内存历史存储替换为自定义实现，这样重启后仍能保留完整历史记录。

## Common mistakes

- 忘记给 `AppConfiguration` 赋值，导致配置类型扫描了但无法正确绑定。
- 把旧文档里的配置注册方式照搬到新架构；当前统一入口是 `Mo.AddConfiguration()`。
