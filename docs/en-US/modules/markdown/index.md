---
title: Markdown
description: Build searchable Markdown catalogs from one or more document roots.
sidebar_position: 1
---

`Monica.Markdown` scans registered document groups, builds hierarchical navigation, parses YAML front matter, and exposes catalog and search abstractions plus `MarkdownFacade`. The built-in provider reads from the file system.

```bash
dotnet add package Monica.Markdown --prerelease
```

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.AddMarkdown(options =>
        options.DocumentSearchMaxResults = 25)
        .AddDocumentGroup(
            key: "product-docs",
            title: "Product documentation",
            basePath: Path.Combine(
                builder.Environment.ContentRootPath,
                "docs"))
        .EnableMultilingualDocuments();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

Recognized extensions default to `.md` and `.markdown`; `_category_.md` supplies folder metadata and is hidden from the document list. Front matter parsing is enabled. Search defaults to keyword-fuzzy matching with a two-character minimum, 50 results, and 180-character previews.

Multilingual discovery treats supported culture folders such as `en-US` and `zh-CN` as language roots and adds Monica localization as a dependency. Use `WithExcludedFolders(...)` to replace global exclusions, `AddExcludedFolders(...)` to extend them, or replace the built-in provider through `UseDocumentProvider<TProvider>()`.

Add `monica.AddMarkdownUI()` from the same Stable package only when the host needs the built-in viewer and local image endpoint; it composes the Monica UI shell separately.
