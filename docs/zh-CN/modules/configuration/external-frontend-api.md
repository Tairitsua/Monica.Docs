---
title: External Frontend API Draft
description: 面向业务系统自建前端嵌入 Monica.Configuration 能力的 Minimal API 接口草案，覆盖参数列表、暂存分析、发布、历史、回滚、导入和导出。
sidebar_position: 7
---

# External Frontend API Draft

本页是给业务系统自建前端使用的 **接口合同草案**。当前 `Monica.Configuration.UI` 是 Blazor 操作台，内部直接注入 `ConfigurationFacade`；本页描述的是后续要通过 Monica 模块 Minimal API 暴露的 HTTP 边界，供业务前端嵌入自己的参数管理 UI。

实现时应保持 Minimal API 很薄：HTTP DTO 负责认证、授权、序列化和前端友好的字段形状；配置领域行为仍通过 `ConfigurationFacade`、mutation/history/rollback 服务和导入导出分析服务完成。

## 设计目标

- 业务前端可以读取参数 definition、schema tree、当前有效值和 source chain。
- 业务前端可以编辑 scalar、object、dictionary、list 和 JSON 快照，并拿到可展示的变更分析结果。
- 所有保存都以 `ConfigurationMutationGroup` 为审计单位发布。
- 历史、diff、group history 和 rollback 与 Monica UI 的语义一致。
- 导入导出使用 versioned JSON package，导入先分析，再发布。
- API 不暴露 `Monica.Configuration.UI` 的内部 state 类型作为长期合同。

## 非目标

- 不把现有 Blazor UI 直接嵌入业务系统。
- 不允许业务前端绕过 facade 直接写 store、history store 或 JSON file。
- 不把 `IsSensitive` 当成权限系统；宿主仍然必须提供认证和授权。
- 不保证跨 source 的强事务。Monica effective store 与外部 JSON source 混合写入时，仍可能出现部分成功的 mutation group。

## 基础约定

| 项 | 约定 |
|---|---|
| Base path | `/api/configuration` |
| HTTP envelope | 使用 Monica `Res<T>` / `Res`，Minimal API 调用 `.GetResponse()` 输出。 |
| JSON 命名 | 推荐外部 HTTP 合同固定为 camelCase；如果宿主配置了 ResultEnvelope field alias，应把别名作为外部合同冻结。 |
| 时间格式 | `DateTimeOffset` 使用 ISO 8601。 |
| enum | 使用字符串值，例如 `"Set"`、`"Remove"`、`"MonicaEffectiveStore"`。 |
| logical path | URL/query/body 中使用 canonical string；服务端用 `LogicalPath.Parse(...)` 还原。 |
| value payload | 对前端暴露 raw JSON value；服务端保存前转换为 `ConfigurationStoredValue.Json`。 |

`value` 字段按 JSON 原生值传输：字符串就是 JSON string，对象就是 JSON object，数组就是 JSON array。`mutationKind = Set` 且 `value = null` 表示把目标值设置为 JSON null；`mutationKind = Remove` 时服务端忽略 `value`。

成功响应示例：

```json
{
  "status": 200,
  "message": "",
  "data": {
    "definitionKey": "docs.portal.demo"
  }
}
```

失败响应示例：

```json
{
  "status": 451,
  "message": "Configuration value validation failed.",
  "metadata": {
    "issues": [
      {
        "definitionKey": "docs.portal.demo",
        "logicalPath": "SearchPageSize",
        "message": "Value must be between 1 and 100."
      }
    ]
  }
}
```

## LogicalPath 约定

`LogicalPath` 是配置管理的稳定身份，不能用 Microsoft configuration key 代替。

| 场景 | canonical logical path |
|---|---|
| 根节点 | 空字符串或省略 `logicalPath` |
| 对象属性 | `Security.Authority` |
| dictionary item | `Services[$billing]` |
| keyed list item | `ConnectedDbs[#main]` |
| list index 诊断 | `ConnectedDbs[@0]` |

路径放入 query string 时必须 URL encode。例如 `Services[$billing].Timeout` 应作为：

```text
/api/configuration/effective-value?definitionKey=gateway&logicalPath=Services%5B%24billing%5D.Timeout
```

## 权限建议

具体认证方案由宿主决定。建议至少拆成以下策略，避免“能看历史的人默认能回滚”：

| Policy | 能力 |
|---|---|
| `Configuration.Read` | definition、参数列表、当前值、source chain。 |
| `Configuration.Write` | JSON draft 分析、暂存变更构造。 |
| `Configuration.Publish` | 发布 mutation group。 |
| `Configuration.History` | 查询 value history、group history、schema publish history。 |
| `Configuration.Rollback` | 回滚 history row、多条 history 或整个 mutation group。 |
| `Configuration.ImportExport` | 导入分析、导出 package。 |
| `Configuration.Debug` | debug view、source file view、完整 source inventory。 |

敏感值默认以 display-safe 方式返回。任何 `includeSensitive = true` 的导出或读取都必须额外要求高权限，并在审计中记录操作者。

## Endpoint 总览

| 能力                     | Method | Path                                                             |
| ---------------------- | ------ | ---------------------------------------------------------------- |
| 参数列表                   | `GET`  | `/api/configuration/parameters`                                  |
| Definition 列表          | `GET`  | `/api/configuration/definitions`                                 |
| Definition 详情          | `GET`  | `/api/configuration/definitions/{definitionKey}`                 |
| Schema publish history | `GET`  | `/api/configuration/definitions/{definitionKey}/publish-history` |
| 当前有效值                  | `GET`  | `/api/configuration/effective-value`                             |
| Source chain           | `GET`  | `/api/configuration/source-chain`                                |
| Runtime sources        | `GET`  | `/api/configuration/sources`                                     |
| Source revision        | `GET`  | `/api/configuration/sources/{sourceKey}/revision`                |
| Source file view       | `GET`  | `/api/configuration/sources/{sourceKey}/file`                    |
| JSON 编辑文档              | `GET`  | `/api/configuration/json-editor-document`                        |
| JSON draft 分析          | `POST` | `/api/configuration/drafts/json/analyze`                         |
| 发布 mutation group      | `POST` | `/api/configuration/mutation-groups`                             |
| Mutation group 列表      | `GET`  | `/api/configuration/mutation-groups`                             |
| Mutation group 详情      | `GET`  | `/api/configuration/mutation-groups/{groupId}`                   |
| Mutation group history | `GET`  | `/api/configuration/mutation-groups/{groupId}/history`           |
| History 查询             | `GET`  | `/api/configuration/history`                                     |
| History 详情             | `GET`  | `/api/configuration/history/{historyId}`                         |
| 回滚单条 history           | `POST` | `/api/configuration/rollback/history/{historyId}`                |
| 回滚多条 history           | `POST` | `/api/configuration/rollback/histories`                          |
| 回滚 mutation group      | `POST` | `/api/configuration/rollback/mutation-groups/{groupId}`          |
| 导出                     | `GET`  | `/api/configuration/export`                                      |
| 导入分析                   | `POST` | `/api/configuration/import/analyze`                              |
| 导入并发布                  | `POST` | `/api/configuration/import/publish`                              |

## 参数与 definition

### `GET /api/configuration/parameters`

给业务前端的首屏列表接口。它把 definition tree 展平成可搜索、可渲染的参数行，并可附带当前有效值。

Query：

| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `definitionKey` | `string?` | `null` | 只返回一个 definition 下的参数。 |
| `search` | `string?` | `null` | 在 display name、definition key、logical path、configuration path 中搜索。 |
| `includeContainers` | `bool` | `false` | 是否返回 object、dictionary、list 节点。 |
| `includeEffectiveValue` | `bool` | `true` | 是否为 scalar 节点附带当前有效值。 |
| `includeSource` | `bool` | `true` | 是否附带 scalar 的 `effectiveSource` 摘要。 |

Response data：

```json
{
  "items": [
    {
      "definitionKey": "docs.portal.demo",
      "definitionDisplayName": "Docs Portal Demo",
      "fromProject": "Domains.Documentation",
      "category": "Documentation",
      "schemaVersion": 1,
      "schemaHash": "sha256:...",
      "logicalPath": "Security.ClientId",
      "configurationPath": "Demo:DocumentationPortal:Security:ClientId",
      "nodeKey": "Security.ClientId",
      "nodeDisplayName": "Client Id",
      "description": "OAuth client id.",
      "nodeKind": "Scalar",
      "valueKind": "String",
      "isNullable": false,
      "isSensitive": false,
      "reloadBehavior": "OnlineReloadable",
      "displayValue": "docs-portal",
      "valueVersion": 12,
      "effectiveSource": {
        "sourceKey": "monica-effective-store",
        "displayName": "Monica Effective Store",
        "kind": "MonicaEffectiveStore",
        "isWritable": true
      }
    }
  ]
}
```

实现映射：

- `ConfigurationFacade.GetDefinitionsAsync()`
- `ConfigurationFacade.GetDefinitionAsync(definitionKey)`
- scalar 行通过 `ConfigurationFacade.GetEffectiveValueAsync(definitionKey, logicalPath)` 填充

后续如果列表规模变大，应在 facade 增加 bulk effective value API，避免 API 层对每个 scalar 做 N+1 调用。

### `GET /api/configuration/definitions`

返回 `ConfigurationDefinitionSummary[]`。用于业务前端先加载 definition 分组，再按需加载详情。

Query：

| 参数 | 类型 | 说明 |
|---|---|---|
| `category` | `string?` | API 层过滤。 |
| `origin` | `ConfigurationDefinitionOrigin?` | `LocalScan` 或 `PublishedMetadata`。 |
| `search` | `string?` | API 层搜索。 |

Facade 映射：`ConfigurationFacade.GetDefinitionsAsync()`。

### `GET /api/configuration/definitions/{definitionKey}`

返回 `ConfigurationDefinitionDetail`，包含完整 `ConfigurationDefinition` 和 schema tree。

Facade 映射：`ConfigurationFacade.GetDefinitionAsync(definitionKey)`。

### `GET /api/configuration/definitions/{definitionKey}/publish-history`

查询 schema metadata publish history。

Query：

| 参数 | 类型 | 默认 |
|---|---|---|
| `limit` | `int` | `20` |

Facade 映射：`ConfigurationFacade.GetDefinitionPublishHistoriesAsync(definitionKey, limit)`。

## 当前值与来源

### `GET /api/configuration/effective-value`

读取某个 logical path 的 display-safe 当前有效值。

Query：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `definitionKey` | `string` | Yes | Definition key。 |
| `logicalPath` | `string?` | No | canonical logical path；为空表示 root。 |

Response data：`ConfigurationEffectiveValue`，其中敏感值的 `displayValue` 为 `null`，`isSensitive = true`。

Facade 映射：`ConfigurationFacade.GetEffectiveValueAsync(definitionKey, LogicalPath.Parse(logicalPath))`。

### `GET /api/configuration/source-chain`

读取一个 scalar path 的 runtime source chain。业务前端可用它解释“为什么我保存了 Monica store 但最终值没有变”。

Query：

| 参数 | 类型 | 必填 |
|---|---|---|
| `definitionKey` | `string` | Yes |
| `logicalPath` | `string` | Yes |

Response data：`ConfigurationSourceChain`。

Facade 映射：`ConfigurationFacade.GetSourceChainAsync(definitionKey, logicalPath)`。

### `GET /api/configuration/sources`

返回当前 Microsoft configuration source 列表，按 runtime priority index 排序。

Facade 映射：`ConfigurationFacade.GetConfigurationSourcesAsync()`。

### `GET /api/configuration/sources/{sourceKey}/revision`

返回可写 source 的当前 revision hash。业务前端发布外部 source mutation 时，应把它作为 `expectedSourceRevision` 传回。

Facade 映射：`ConfigurationFacade.GetSourceRevisionAsync(sourceKey)`。

### `GET /api/configuration/sources/{sourceKey}/file`

返回 display-safe JSON file view。已知敏感路径必须 redacted。

Facade 映射：`ConfigurationFacade.GetSourceFileViewAsync(sourceKey)`。

## JSON draft 与复杂类型编辑

复杂 object、dictionary、list 和 JSON 编辑不应直接保存。前端应先调用 draft 分析接口，把输入 JSON 转换成 saveable changes、validation issues 和 diagnostics。

### `GET /api/configuration/json-editor-document`

构造某个 scope 的可编辑 JSON 文档，包含当前 pending changes 后的显示值，并对敏感值脱敏。

Query：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `definitionKey` | `string` | Yes | Definition key。 |
| `scopePath` | `string?` | No | 编辑范围；为空表示 root。 |
| `pendingChangeToken` | `string?` | No | 如果 API 层实现服务端 draft session，可用它合并已有暂存。v1 可不支持。 |

Response data：

```json
{
  "definitionKey": "docs.portal.demo",
  "scopePath": "Security",
  "json": "{\n  \"clientId\": \"docs-portal\",\n  \"clientSecret\": \"***\"\n}",
  "redactedPaths": [
    "Security.ClientSecret"
  ],
  "schemaVersion": 1,
  "valueVersion": 12
}
```

实现映射：应把 `ConfigurationJsonDraftService.BuildEditorDocument(...)` 的逻辑从 UI internal 服务提升为 API 可复用服务，或在 Configuration 模块新增等价服务。

### `POST /api/configuration/drafts/json/analyze`

分析用户提交的 JSON，并返回前端可渲染的变更状态。

Request：

```json
{
  "definitionKey": "docs.portal.demo",
  "scopePath": "Security",
  "json": "{\n  \"clientId\": \"docs-portal-v2\",\n  \"authority\": \"https://login.example.com\"\n}",
  "redactedPaths": [
    "Security.ClientSecret"
  ],
  "compactChanges": true
}
```

Response data：

```json
{
  "definitionKey": "docs.portal.demo",
  "definitionDisplayName": "Docs Portal Demo",
  "scopePath": "Security",
  "changes": [
    {
      "definitionKey": "docs.portal.demo",
      "logicalPath": "Security.ClientId",
      "displayChangeKind": "Modified",
      "mutationKind": "Set",
      "targetKind": "MonicaEffectiveStore",
      "value": "docs-portal-v2",
      "originalDisplayValue": "docs-portal",
      "newDisplayValue": "docs-portal-v2",
      "expectedSchemaVersion": 1,
      "expectedValueVersion": 12,
      "nodeKind": "Scalar",
      "valueKind": "String",
      "isSensitive": false,
      "reloadBehavior": "OnlineReloadable"
    }
  ],
  "validationIssues": [],
  "diagnostics": [],
  "unchangedCount": 4,
  "redactedSkipCount": 1,
  "isJsonValid": true,
  "parseError": null
}
```

`displayChangeKind` 是 API DTO 建议字段，用于业务前端直接渲染复杂编辑差异：

| 值 | UI 含义 | 推导规则 |
|---|---|---|
| `Added` | 新增项，建议绿色 | 目标 path 原来不存在，发布为 `Set`。 |
| `Removed` | 删除项，建议红色 | `mutationKind = Remove`。 |
| `Modified` | 修改项，建议黄色 | path 原来存在，发布为 `Set` 且 old/new 不同。 |

保存时前端只需要把 `changes` 中的 saveable fields 传给 `POST /api/configuration/mutation-groups`。`validationIssues` 不能发布，必须阻止保存。

实现映射：

- 复用或提升 `ConfigurationJsonDraftService.Analyze(...)`。
- API DTO 不应直接暴露 `Monica.Configuration.UI.State.PendingChange`，应定义稳定的外部 `ConfigurationDraftChangeDto`。
- `value` 对外使用 raw JSON value；服务端发布前转换成 `ConfigurationStoredValue.Json`。

## 发布 MutationGroup

### `POST /api/configuration/mutation-groups`

创建并发布一个 mutation group。单个参数修改也应使用该接口，只是 `changes` 只有一项。

Request：

```json
{
  "label": "Update docs portal OAuth settings",
  "reason": "Rotate frontend client id for staging.",
  "changes": [
    {
      "definitionKey": "docs.portal.demo",
      "logicalPath": "Security.ClientId",
      "mutationKind": "Set",
      "targetKind": "MonicaEffectiveStore",
      "value": "docs-portal-v2",
      "expectedSchemaVersion": 1,
      "expectedValueVersion": 12
    },
    {
      "definitionKey": "docs.portal.demo",
      "logicalPath": "PortalTitle",
      "mutationKind": "Set",
      "targetKind": "ExternalConfigurationSource",
      "sourceKey": "json-file:docs-external-settings.json",
      "expectedSourceRevision": "sha256:...",
      "value": "External JSON Docs Portal"
    }
  ]
}
```

Response data：

```json
{
  "status": "Applied",
  "group": {
    "groupId": "cfggrp_01HZY...",
    "label": "Update docs portal OAuth settings",
    "reason": "Rotate frontend client id for staging.",
    "mutationCount": 2,
    "definitionKeys": [
      "docs.portal.demo"
    ],
    "status": "Applied"
  },
  "results": [
    {
      "definitionKey": "docs.portal.demo",
      "logicalPath": "Security.ClientId",
      "newVersion": 13,
      "schemaVersion": 1,
      "requiresRestart": false
    }
  ],
  "failedChange": null
}
```

发布规则：

- API 必须先做请求级校验：`label` 非空、`changes` 非空、每个 path 可解析、没有 validation issue。
- 创建 group 后按请求顺序写入。
- `targetKind = MonicaEffectiveStore` 时调用 `ConfigurationFacade.MutateAsync(...)`。
- `targetKind = ExternalConfigurationSource` 时调用 `ConfigurationFacade.MutateSourceAsync(...)`。
- 全部成功后调用 `CompleteMutationGroupAsync(...)`。
- 如果部分成功，必须调用 `MarkMutationGroupPartialAsync(...)`，并返回包含 `failedChange`、已成功数量和 group id 的响应。

建议部分成功响应使用 `ResStatus.ErrorWarning`，HTTP status 为 `460`，因为它需要前端提示用户刷新状态并查看 group history。

Facade 映射：

1. `BeginMutationGroupAsync(label, reason, context)`
2. 对每个 change 调用 `MutateAsync(...)` 或 `MutateSourceAsync(...)`
3. `CompleteMutationGroupAsync(...)` 或 `MarkMutationGroupPartialAsync(...)`

## MutationGroup 查询

### `GET /api/configuration/mutation-groups`

Query：

| 参数 | 类型 | 说明 |
|---|---|---|
| `from` | `DateTimeOffset?` | 起始创建时间。 |
| `to` | `DateTimeOffset?` | 结束创建时间。 |
| `definitionKey` | `string?` | 只看影响某个 definition 的 group。 |

Response data：`ConfigurationMutationGroup[]`。

Facade 映射：`ConfigurationFacade.GetMutationGroupsAsync(from, to, definitionKey)`。

### `GET /api/configuration/mutation-groups/{groupId}`

Response data：`ConfigurationMutationGroup`。

Facade 映射：`ConfigurationFacade.GetMutationGroupAsync(groupId)`。

### `GET /api/configuration/mutation-groups/{groupId}/history`

Response data：`ConfigurationValueHistory[]`，按 group 中 history 顺序返回。

Facade 映射：`ConfigurationFacade.GetGroupHistoryAsync(groupId)`。

## 历史与回滚

### `GET /api/configuration/history`

Query：

| 参数 | 类型 | 说明 |
|---|---|---|
| `from` | `DateTimeOffset?` | 起始修改时间。 |
| `to` | `DateTimeOffset?` | 结束修改时间。 |
| `definitionKey` | `string?` | Definition filter。 |
| `logicalPath` | `string?` | canonical logical path filter。 |
| `mutationGroupId` | `string?` | Mutation group filter。 |

Response data：`ConfigurationValueHistory[]`。

Facade 映射：`ConfigurationFacade.QueryHistoryAsync(...)`。如果同时指定 `definitionKey` 和 `logicalPath`，也可以调用 `GetHistoryAsync(...)`。

### `GET /api/configuration/history/{historyId}`

Response data：`ConfigurationValueHistory`。

当前 facade 还没有公开 `GetHistoryByIdAsync(...)`，实现 Minimal API 时应补一个 facade 方法，内部使用 `IConfigurationHistoryService.GetHistoryByIdAsync(...)`。

### `POST /api/configuration/rollback/history/{historyId}`

Request：

```json
{
  "reason": "Rollback accidental staging value."
}
```

Response data：`ConfigurationMutationResult`。

Facade 映射：`ConfigurationFacade.RollbackHistoryAsync(historyId, reason)`。

### `POST /api/configuration/rollback/histories`

Request：

```json
{
  "historyIds": [
    "cfghis_01HZY...",
    "cfghis_01HZZ..."
  ],
  "reason": "Rollback selected OAuth changes."
}
```

Response data：`ConfigurationMutationResult[]`。服务端按 reverse history order 回滚。

Facade 映射：`ConfigurationFacade.RollbackHistoriesAsync(historyIds, reason)`。

### `POST /api/configuration/rollback/mutation-groups/{groupId}`

Request：

```json
{
  "reason": "Rollback failed rollout."
}
```

Response data：`ConfigurationMutationResult[]`。

Facade 映射：`ConfigurationFacade.RollbackGroupAsync(groupId, reason)`。

回滚本身也是 mutation，会写入新的 history，并把原 group 标记为 rolled back。

## 导出

### `GET /api/configuration/export`

导出当前环境的 Monica-managed configuration package。默认不包含敏感值。

Query：

| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `definitionKey` | `string?` | `null` | 只导出一个 definition；为空导出全部。 |
| `includeSensitive` | `bool` | `false` | 是否包含敏感值。必须有高权限。 |
| `exportedBy` | `string?` | `null` | 写入 package metadata。 |
| `systemVersion` | `string?` | `null` | 写入 package metadata。 |
| `environmentName` | `string?` | `null` | 写入 package metadata。 |

Response data：`ConfigurationExportDocument`。

```json
{
  "formatVersion": 1,
  "exportedAt": "2026-06-22T10:30:00+08:00",
  "exportedBy": "mo",
  "systemVersion": "1.4.0",
  "environmentName": "staging",
  "includeSensitive": false,
  "definitions": [
    {
      "definitionKey": "docs.portal.demo",
      "displayName": "Docs Portal Demo",
      "fromProject": "Domains.Documentation",
      "category": "Documentation",
      "clrTypeName": "Domains.Documentation.DocsPortalOptions",
      "schemaVersion": 1,
      "schemaHash": "sha256:...",
      "valueVersion": 12,
      "sourceSummary": [
        "Monica Effective Store"
      ],
      "value": {
        "portalTitle": "Docs Portal"
      },
      "redactedPaths": [
        "Security.ClientSecret"
      ]
    }
  ]
}
```

实现映射：把 `ConfigurationParameterPackageService.CreateExportAsync(...)` 从 UI internal 能力提升到 API 可复用服务，或在 Configuration 模块新增等价 package service。

## 导入

### `POST /api/configuration/import/analyze`

导入分析只返回报告，不写入 store。

Request：

```json
{
  "fileName": "configuration-staging-20260622.json",
  "document": {
    "formatVersion": 1,
    "definitions": []
  },
  "compactChanges": true
}
```

Response data：

```json
{
  "fileName": "configuration-staging-20260622.json",
  "drafts": [
    {
      "definitionKey": "docs.portal.demo",
      "definitionDisplayName": "Docs Portal Demo",
      "changes": [],
      "validationIssues": [],
      "diagnostics": [],
      "unchangedCount": 8,
      "redactedSkipCount": 1
    }
  ],
  "diagnostics": [],
  "hasBlockingIssues": false
}
```

报告规则：

- unknown definition/path：diagnostic warning，不直接失败。
- schema version/hash mismatch：diagnostic warning，前端应提示用户确认。
- redacted paths：跳过，不生成 change。
- validation issue：blocking，不能发布。
- read-only source：blocking，因为导入目标是当前生效且可写的 source。

实现映射：提升或复用 `ConfigurationParameterPackageService.AnalyzeImportAsync(...)`。

### `POST /api/configuration/import/publish`

导入并发布是 convenience endpoint。它必须先执行同样的 analyze；只有没有 blocking issue 时，才创建 mutation group 并发布分析出的 changes。

Request：

```json
{
  "label": "Import staging configuration package",
  "reason": "Sync approved staging parameters.",
  "fileName": "configuration-staging-20260622.json",
  "document": {
    "formatVersion": 1,
    "definitions": []
  },
  "compactChanges": true,
  "allowWarnings": false
}
```

Response data：

```json
{
  "report": {
    "hasBlockingIssues": false,
    "diagnostics": []
  },
  "publishResult": {
    "status": "Applied",
    "group": {
      "groupId": "cfggrp_01HZY..."
    },
    "results": []
  }
}
```

如果 `allowWarnings = false` 且存在 warning diagnostic，建议返回 `ResStatus.ErrorWarning`，让前端二次确认后重试。

## 推荐前端流程

### 首屏加载

1. 调用 `GET /api/configuration/parameters?includeEffectiveValue=true`。
2. 按 `category`、`definitionDisplayName`、`logicalPath` 分组渲染。
3. 用户点开某个 scalar 时，按需调用 `GET /api/configuration/source-chain` 展示来源链路。

### 修改并发布

1. scalar 编辑直接构造一个 `ConfigurationDraftChangeDto`。
2. complex / JSON 编辑先调用 `POST /api/configuration/drafts/json/analyze`。
3. 前端使用 `displayChangeKind` 渲染新增、删除、修改状态。
4. 如果 `validationIssues` 非空，禁用发布。
5. 调用 `POST /api/configuration/mutation-groups` 发布。
6. 发布成功后刷新参数列表和 group history。

### 导入

1. 用户上传 package JSON。
2. 调用 `POST /api/configuration/import/analyze`。
3. 展示 changes、validation issues、diagnostics、redacted skips。
4. 用户确认后，调用 `POST /api/configuration/mutation-groups` 发布报告中的 changes，或直接调用 `POST /api/configuration/import/publish`。

### 回滚

1. 调用 `GET /api/configuration/history` 或 `GET /api/configuration/mutation-groups/{groupId}/history`。
2. 展示 old/new diff。
3. 用户确认后调用 rollback endpoint。
4. 刷新参数列表、history 和 group 状态。

## 实现注意事项

- API DTO 应放在 Configuration 模块的 public contract 中，不要把 `Monica.Configuration.UI.State.PendingChange`、`ConfigurationValidationIssue` 等 UI internal 类型作为外部 API 合同。
- 导入导出和 JSON draft 的核心逻辑现在在 UI support service 中；实现 API 前应把这部分提升到 Configuration 模块或公共 application service。
- 发布接口必须统一写 mutation group，避免出现“单条 mutation 没有审计组”的外部入口。
- 外部 source mutation 必须使用 `expectedSourceRevision`；Monica effective store mutation 必须使用 `expectedValueVersion`。
- `expectedSchemaVersion` 必须来自当前 definition，schema mismatch 时返回 validation/error response，不应静默保存。
- 敏感值默认只能返回 redacted display value。被 redacted 的导入 path 必须 skip，不能把占位文本保存回 store。
- `includeSensitive = true`、rollback、debug/source file view 都应有更强权限和审计记录。
