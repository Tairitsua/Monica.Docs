---
title: Monica Documentation
description: The English documentation set is still being migrated. Use the language switcher to check translated pages as they become available.
sidebar_position: 1
---

# Monica Documentation

The documentation tree now uses a language-first layout.

Configure host-level Monica defaults through root `Mo.Config*()` methods before module registration:

```csharp
Mo.ConfigApplication(options =>
{
    options.AppName = "My Application";
});

Mo.ConfigModuleSystem(options =>
{
    options.DefaultApiGroupName = "Core";
});
```

Module-specific options remain the highest-priority configuration source.

- Current available language folders: `zh-CN`, `en-US`
- Most detailed content is still authored under `zh-CN`

Use the language switcher in `/markdown-docs` to move between language folders.
