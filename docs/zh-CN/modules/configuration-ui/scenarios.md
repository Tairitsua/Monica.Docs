---
title: Scenarios
description: Configuration UI 的常见使用方式、来源链路排查、导入导出、JSON 编辑和历史回滚注意事项。
sidebar_position: 5
---

## 场景 1 — 内部运维配置台

在内部管理应用中注册 `monica.AddConfigurationUI()`，即可提供配置查看、编辑、来源链路、导入导出和历史页面。单体应用可使用 file store；分布式应用应使用 DB store，这样所有实例共享同一份 Monica-managed effective values、metadata 和 history。

## 场景 2 — 演示和开发环境

开发环境通常这样注册：

```csharp
builder.AddMonica(monica =>
{
    monica.AddConfiguration()
        .UseFileConfigurationStore();
    monica.AddConfigurationUI();
});
```

File store 会在本地生成 effective JSON document，适合观察复杂对象、dictionary、list item key、敏感值、source chain、导入导出和重启提示。

## 场景 3 — 现场交付 JSON 覆盖文件

```csharp
builder.AddMonica(monica =>
{
    monica.AddConfiguration()
        .UseFileConfigurationStore()
        .AddManagedJsonFile(
            "operator-settings.json",
            optional: true,
            reloadOnChange: true,
            options =>
            {
                options.DisplayName = "Operator Settings";
                options.IsWritable = true;
            });
    monica.AddConfigurationUI();
});
```

在配置状态页中，如果某个配置项被 `operator-settings.json` 覆盖，行内会显示外部来源提示。用户点击来源按钮可以查看完整链路；保存修改时，UI 会提示目标是外部 JSON 文件，并记录外部 source history。

## 场景 4 — 排查配置来源

当值“不等于 Monica store 里的值”时，打开来源详情：

1. 在配置状态页选择配置定义。
2. 点击配置项右侧来源按钮。
3. 查看 source chain，最上方高亮的 source 是当前生效来源。
4. 如果来源只读，UI 会显示 read-only reason。

也可以打开 `/configuration/storage`，查看每个 provider 的 supplied count、effective count 和详情列表。

## 场景 5 — 导出参数包

导出适合备份、现场交付和环境同步：

- 默认导出全部 Monica-managed definitions。
- 可以从选中配置定义只导出一个 definition。
- 默认脱敏敏感值；只有显式选择 include sensitive 时才输出明文。
- 导出文件记录 schema version/hash、source summary、value version、导出时间、操作人、系统版本和环境名。

导出文件只覆盖 Monica-managed definitions。非受管 runtime key 即使在来源页面可见，也不会作为参数定义导出。

## 场景 6 — 导入参数包

导入流程不会直接写入 store：

1. 上传 `.json` 参数包。
2. 查看导入报告。
3. 确认后把有效变更暂存到配置状态页。
4. 在保存修改组 dialog 中查看 diff、validation issue 和目标 source。
5. 最终保存 mutation group。

如果导入文件包含未知 definition/path，UI 会报告并跳过。被 redacted 的路径保持当前值不变。无效值会进入 validation issue，保存按钮保持禁用，用户可以点击跳转回对应配置项修正。

## 场景 7 — 用 JSON 编辑复杂节点

复杂节点预览 dialog 可以进入 JSON 编辑。例如编辑 `Services`：

```json
{
  "docs": {
    "DisplayName": "Documentation",
    "Endpoint": "https://docs.internal.local",
    "ConnectedDbs": [
      {
        "Name": "catalog",
        "Provider": "PostgreSQL",
        "TimeoutSeconds": 30
      }
    ]
  }
}
```

UI 会用 schema 解析 JSON，跳过未变化值，报告未知字段和验证错误，并生成 diff preview。确认后通常压缩成一条 container pending change，例如 `Set Services`，历史中也会更容易审计。

## 场景 8 — 查看和回滚历史

历史页支持：

- 按单条修改查看 timeline diff。
- 按 mutation group 查看一组变更。
- 识别 `MonicaEffectiveStore` 与 `ExternalConfigurationSource`。
- 对外部 source 修改展示 provider、display name、physical path 和 configuration path。
- 对复杂节点或旧的多 scalar history 做视觉折叠。
- 回滚单条 history、多条 grouped history 或整个 mutation group。

回滚仍然走正常 mutation 流程。外部 JSON source 的回滚会写回对应 JSON 文件；Monica store 的回滚会写回 active store bundle。

## Common mistakes

- 以为 UI 会自动选择存储。核心模块必须显式配置 `UseFileConfigurationStore(...)` 或 `UseDbConfigurationStore(...)`。
- 以为配置状态页永远编辑 Monica store。页面编辑的是当前生效且可写的目标 source。
- 以为修改后所有值都能热更新。`RequiresRestart` 和 `StaticAfterStartup` 节点会提示需要重启。
- 以为敏感值能在 UI 中完整查看。敏感值默认按 display-safe 方式处理。
- 以为导入会绕过验证直接覆盖。导入只生成暂存状态，最终仍然经过验证、diff 和 mutation group 保存。
- 把 UI 当作 store 扩展点。store 扩展应在 `Monica.Configuration` 中实现 effective value、metadata 和 history store contract。
