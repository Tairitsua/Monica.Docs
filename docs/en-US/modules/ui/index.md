---
title: UI
description: Host Monica's Blazor operational pages in one shared, theme-aware shell.
sidebar_position: 1
---

# UI

`Monica.UI` provides the interactive server Blazor shell, MudBlazor services, navigation registry, browser storage, themes, localization, and static-asset mapping used by Monica operational pages.

```bash
dotnet add package Monica.UI --prerelease
```

```csharp
using Monica.Core.Modularity.Extensions;
using Monica.Modules;
using Monica.UI.Theming;

var builder = WebApplication.CreateBuilder(args);

builder.AddMonica(monica =>
{
    monica.ConfigureApplication(options =>
    {
        options.AppId = "orders";
        options.AppName = "Orders operations";
    });

    monica.AddUIShell(options =>
    {
        options.DefaultTheme = MonicaThemeKind.Default;
        options.DefaultDarkMode = false;
        options.ShowLanguageSwitcher = true;
    });

    monica.AddModuleSystemUI();
});

var app = builder.Build();
app.UseMonica();
app.MapMonica();
app.Run();
```

Browser-stored theme and dark-mode choices override host defaults on later visits. The shell shows up to six navigation categories before moving extras into “More”, enables navigation search, and shows the language switcher by default.

`EnableDebug` follows the build configuration: enabled in DEBUG builds and disabled otherwise. Keep detailed Blazor and SignalR errors disabled in production because they can expose implementation details.

Operational UI packages—such as `Monica.Configuration.UI`, `Monica.Repository.UI`, `Monica.JobScheduler.UI`, and `Monica.OpenTelemetry.UI`—are separate Stable packages. Add only the pages an operator should see, and protect the shell with the host's authentication and network policy.
