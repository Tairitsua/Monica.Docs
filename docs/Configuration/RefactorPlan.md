# Refactoring Plan: Embed AppId into Configuration Key Format

## Overview

Simplify the configuration API by embedding AppId into the Key format, eliminating the need for separate AppId parameters. This reduces frontend complexity and makes the API more intuitive.

## Current vs New Key Format

**Current:**
- Config class: `DatabaseOption`
- Option item: `Database:ConnectionString`
- AppId: Passed separately as parameter

**New:**
- Config class: `FlightService:DatabaseOption`
- Option item: `FlightService:Database:ConnectionString`
- AppId: Embedded in Key, extracted when needed

## Implementation Strategy

The AppId will be prepended to Keys during DTO conversion (not at OptionItem creation), since:
1. OptionItem is a core model representing configuration structure
2. AppId is only available at the service level (from IMoProjectCatalog)
3. DTO conversion happens in `MoConfigurationCardManager.GetConfigs()` where AppId is accessible

## Critical Files to Modify

### Phase 1: Core Infrastructure

**1. Create Key Helper Utility**
- File: `/mnt/d/Code/MoLibrary/Monica.Configuration/Utilities/ConfigurationKeyHelper.cs` (new)
- Purpose: Centralize key format logic
- Methods:
  - `ExtractAppId(string key)` → `(string AppId, string ConfigKey)`
  - `BuildKey(string appId, string configKey)` → `string`
  - `HasAppIdPrefix(string key)` → `bool`

**2. Update DTO Conversion in MoConfigurationCardManager**
- File: `/mnt/d/Code/MoLibrary/Monica.Configuration/Interfaces/MoConfigurationCardManager.cs`
- Line 78-99: Modify `ToDtoOptionItem()` to accept AppId parameter and prepend it to Key
- Line 106-119: Modify `ToDtoConfig()` to accept AppId parameter and prepend it to config Name
- Line 21-72: Pass AppId through conversion chain in `GetConfigs()`

### Phase 2: API Models

**3. Update DtoUpdateConfig**
- File: `/mnt/d/Code/MoLibrary/Monica.Configuration.UI/Model/DtoUpdateConfig.cs`
- Remove `AppId` property (line 10)
- Update comment on `Key` property to indicate it includes AppId

**4. Update DtoUpdateConfigRes**
- File: Same as above
- Keep `AppId` property for display convenience (line 26)
- Add comment noting it's redundant with Key prefix

**5. Update RollbackRequest**
- File: `/mnt/d/Code/MoLibrary/Monica.Configuration.UI/Modules/ModuleConfigurationUI.cs`
- Line 178-183: Remove `AppId` property

### Phase 3: API Interfaces and Endpoints

**6. Update IMoConfigurationApi Interface**
- File: `/mnt/d/Code/MoLibrary/Monica.Configuration.UI/Interfaces/IMoConfigurationApi.cs`
- Remove `appid` parameter from:
  - `GetOptionItemAsync(string key, string? appid)` → `GetOptionItemAsync(string key)`
  - `GetConfigAsync(string key, string? appid)` → `GetConfigAsync(string key)`
  - `GetConfigHistoryAsync(..., string? appid, ...)` → `GetConfigHistoryAsync(...)`
  - `RollbackConfigAsync(string key, string appid, string version)` → `RollbackConfigAsync(string key, string version)`

**7. Update API Endpoints**
- File: `/mnt/d/Code/MoLibrary/Monica.Configuration.UI/Modules/ModuleConfigurationUI.cs`
- Line 118-127: Remove `appid` query parameter from history endpoint
- Line 129-137: Update rollback endpoint (AppId removed from RollbackRequest)
- Line 139-147: Update config update endpoint (AppId removed from DtoUpdateConfig)
- Line 149-158: Remove `appid` query parameter from option status endpoint

### Phase 4: Service Layer

**8. Update ConfigurationUIService**
- File: `/mnt/d/Code/MoLibrary/Monica.Configuration.UI/Services/ConfigurationUIService.cs`
- Remove `appid` parameter from all methods:
  - `GetOptionItemAsync` (line 41)
  - `GetConfigAsync` (line 60)
  - `GetConfigHistoryAsync` (line 81)
  - `RollbackConfigAsync` (line 123)

### Phase 5: Provider Implementations

**9. Update ConfigurationClientApiProvider**
- File: `/mnt/d/Code/MoLibrary/Monica.Configuration.UI/Implements/ConfigurationClientApiProvider.cs`
- Line 33-55: `GetOptionItemAsync` - Remove appid parameter, extract from key for filtering
- Line 57-78: `GetConfigAsync` - Remove appid parameter, extract from key for filtering
- Line 80-97: `GetConfigHistoryAsync` - Remove appid parameter, extract from key if provided
- Line 99-130: `UpdateConfigAsync` - Extract AppId from req.Key for routing
- Line 132-143: `RollbackConfigAsync` - Extract AppId from key parameter
- Line 145-157: `SaveHistory` - Extract AppId from res.Key instead of parameter

**10. Update ConfigurationCentreApiProvider**
- File: `/mnt/d/Code/MoLibrary/Monica.Configuration.UI/Implements/ConfigurationCentreApiProvider.cs`
- Line 37-46: `GetOptionItemAsync` - Remove appid parameter, extract from key
- Line 48-57: `GetConfigAsync` - Remove appid parameter, extract from key
- Line 59-65: `UpdateConfigAsync` - Extract AppId from req.Key for routing to correct service

### Phase 6: Storage Layer

**11. Update IMoConfigurationStores Interface**
- File: `/mnt/d/Code/MoLibrary/Monica.Configuration.UI/Interfaces/IMoConfigurationStores.cs`
- Remove `appid` parameter from:
  - `GetHistory(string key, string appid)` → `GetHistory(string key)`
  - `GetHistory(string key, string appid, string version)` → `GetHistory(string key, string version)`

**12. Update MoConfigurationDefaultMemoryStore**
- File: Same as above (lines 40-115)
- `SaveUpdate`: Extract AppId from config.Key
- `GetHistory(key)`: Use Key directly (includes AppId)
- `GetHistory(key, version)`: Use Key directly (includes AppId)
- Update all LINQ queries to filter by full Key instead of AppId + Key

### Phase 7: Frontend Components

**13. Update ConfigurationStateManager**
- File: `/mnt/d/Code/MoLibrary/Monica.Configuration.UI/Model/ConfigurationStateManager.cs`
- Line 99-104: Remove AppId from DtoUpdateConfig construction
- Update `BuildUpdateRequests()` to use Key directly (already includes AppId)

**14. Update ConfigurationExplorer.razor**
- File: `/mnt/d/Code/MoLibrary/Monica.Configuration.UI/UIConfiguration/Components/ConfigurationExplorer.razor`
- Remove `editingAppId` field
- Update `OpenEditDialog` method to not pass AppId
- Update history dialog to not pass AppId parameter

**15. Update ConfigurationHistory.razor**
- File: `/mnt/d/Code/MoLibrary/Monica.Configuration.UI/UIConfiguration/Components/ConfigurationHistory.razor`
- Update `LoadHistoryForConfigAsync` to not pass appid parameter
- Update rollback call to not pass appid parameter
- Extract AppId from Key for display purposes if needed

**16. Update SaveConfirmationDialog.razor**
- File: `/mnt/d/Code/MoLibrary/Monica.Configuration.UI/UIConfiguration/Components/SaveConfirmationDialog.razor`
- Extract AppId from Key for display using `ConfigurationKeyHelper.ExtractAppId()`

## Implementation Details

### Key Helper Implementation

```csharp
namespace Monica.Configuration.Utilities;

public static class ConfigurationKeyHelper
{
    public static (string AppId, string ConfigKey) ExtractAppId(string key)
    {
        var parts = key.Split(':', 2);
        if (parts.Length != 2)
            throw new ArgumentException($"Invalid key format: {key}");
        return (parts[0], parts[1]);
    }

    public static string BuildKey(string appId, string configKey)
    {
        if (string.IsNullOrWhiteSpace(appId))
            throw new ArgumentNullException(nameof(appId));
        if (string.IsNullOrWhiteSpace(configKey))
            throw new ArgumentNullException(nameof(configKey));
        return $"{appId}:{configKey}";
    }

    public static bool HasAppIdPrefix(string key)
    {
        return key.Contains(':') && key.Split(':', 2).Length == 2;
    }
}
```

### DTO Conversion Update

In `MoConfigurationCardManager.GetConfigs()`:

```csharp
var currentAppId = catalog.CurrentAppId;
var serviceConfig = new DtoServiceGroup()
{
    AppId = currentAppId,
    Name = tmpCard.FromProjectName,
    Title = catalog.GetProjectDisplayName(tmpCard.FromProjectName),
    Children = cards.Select(c => new DtoConfig()
    {
        Name = ConfigurationKeyHelper.BuildKey(currentAppId, c.Key),
        Type = c.Configuration.Info.Type,
        Desc = c.Description,
        Title = c.Title,
        Version = c.Version,
        Items = c.Configuration.OptionItems
            .Select(i => i.ToDtoOptionItem(c.Configuration, currentAppId))
            .ToList(),
    }).ToList()
};
```

Update `ToDtoOptionItem()` signature:

```csharp
public static DtoOptionItem ToDtoOptionItem(this OptionItem i, MoConfiguration c, string appId)
{
    var dto = new DtoOptionItem
    {
        // ... other properties ...
        Key = ConfigurationKeyHelper.BuildKey(appId, i.Key),
        // ... other properties ...
    };
    return dto;
}
```

### Routing in Distributed Mode

In `ConfigurationCentreApiProvider.UpdateConfigAsync()`:

```csharp
public override async Task<Res<DtoUpdateConfigRes>> UpdateConfigAsync(DtoUpdateConfig req)
{
    _cache = default;
    var (appId, _) = ConfigurationKeyHelper.ExtractAppId(req.Key);

    if((await invoker.UpdateRemoteConfigAsync(appId, req))
        .IsFailed(out var remoteError, out var remoteData))
        return remoteError;
    return remoteData;
}
```

## Verification Steps

After implementation, verify:

1. **Key Generation**: Check that all DTOs have Keys with AppId prefix
2. **API Calls**: Test all endpoints without appid parameter
3. **History Storage**: Verify history is stored and retrieved correctly
4. **Rollback**: Test rollback functionality with new Key format
5. **Distributed Mode**: Verify routing works by extracting AppId from Key
6. **Frontend**: Test configuration editing, saving, and history viewing
7. **Error Handling**: Verify clear error messages for invalid Key formats

## Benefits

1. **Simplified API**: Single Key parameter instead of Key + AppId
2. **Cleaner Frontend**: No need to track AppId separately
3. **Better Encapsulation**: AppId is part of the identity
4. **Reduced Errors**: No AppId/Key mismatch possible
5. **Clearer Intent**: Key format explicitly shows ownership

## Notes

- No backward compatibility required (development phase per CLAUDE.md)
- DtoServiceGroup.AppId property kept for internal use
- DtoOptionHistory.AppId kept for display convenience (redundant with Key)
- All existing configuration data will be cleared (in-memory store)
