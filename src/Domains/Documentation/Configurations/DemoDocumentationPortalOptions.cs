using System.ComponentModel.DataAnnotations;
using Monica.Configuration.Annotations;
using Monica.Configuration.Models;

namespace Domains.Documentation.Configurations;

[Configuration(SectionName,
    DefinitionKey = "docs.portal.demo",
    DisplayName = "Docs Portal Demo",
    Description = "Demonstrates grouped portal configuration with scalar values, validation metadata, nested objects, restart impact, and sensitive fields.",
    Category = "Documentation Demo",
    ReloadBehavior = ConfigurationReloadBehavior.OnlineReloadable)]
public sealed class DemoDocumentationPortalOptions
{
    public const string SectionName = "Demo:DocumentationPortal";

    [Required]
    [MinLength(3)]
    [MaxLength(80)]
    [OptionSetting("Portal Title", Description = "Human-readable title displayed by the documentation portal shell.")]
    public string PortalTitle { get; set; } = "Monica Operator Docs";

    [Range(1, 200)]
    [OptionSetting("Search Page Size", Description = "Maximum number of search results returned per page.")]
    public int SearchPageSize { get; set; } = 20;

    [OptionSetting("Public Base Url", Description = "External URL used when generating absolute documentation links.")]
    public Uri PublicBaseUrl { get; set; } = new("https://docs.monica.local");

    [OptionSetting("Require Login", Description = "Whether the portal requires authenticated users for all documentation pages.")]
    public bool RequireLogin { get; set; } = true;

    [OptionSetting("Cache TTL", Description = "How long rendered markdown pages remain in the local cache.")]
    public TimeSpan CacheTtl { get; set; } = TimeSpan.FromMinutes(15);

    [OptionSetting("Deployment Slot", Description = "Operational slot for this portal instance. Changing it after startup requires a restart.", ReloadBehavior = ConfigurationReloadBehavior.RequiresRestart)]
    public DemoDeploymentSlot DeploymentSlot { get; set; } = DemoDeploymentSlot.Staging;

    [OptionSetting("Theme", Description = "Nested theme and content presentation settings.")]
    public DemoPortalThemeOptions Theme { get; set; } = new();

    [OptionSetting("Security", Description = "Nested authentication and token settings.")]
    public DemoPortalSecurityOptions Security { get; set; } = new();

    [OptionSetting("Featured Tags", Description = "Free-form tags promoted on the documentation landing page.")]
    public List<string> FeaturedTags { get; set; } = ["configuration", "ui", "release-notes"];

    [OptionSetting("Supported Locales", Description = "Locale tabs exposed by the portal language switcher.")]
    public List<DemoPortalLocale> SupportedLocales { get; set; } = [DemoPortalLocale.ZhCn, DemoPortalLocale.EnUs];

    [OptionSetting("Route Aliases", Description = "Scalar dictionary mapping short route aliases to canonical documentation paths.")]
    public Dictionary<string, string> RouteAliases { get; set; } = new(StringComparer.OrdinalIgnoreCase)
    {
        ["quickstart"] = "/modules/configuration/quick-start",
        ["configuration"] = "/modules/configuration/configuration",
        ["scenarios"] = "/modules/configuration/scenarios"
    };

    [OptionSetting("Role Access Modes", Description = "Scalar enum dictionary used to validate role-specific portal access behavior.")]
    public Dictionary<string, DemoPortalAccessMode> RoleAccessModes { get; set; } = new(StringComparer.OrdinalIgnoreCase)
    {
        ["reader"] = DemoPortalAccessMode.ReadOnly,
        ["author"] = DemoPortalAccessMode.EditDrafts,
        ["operator"] = DemoPortalAccessMode.Publish
    };

    [OptionSetting("Maintenance Windows", Description = "Scalar TimeSpan dictionary for recurring portal maintenance slots.")]
    public Dictionary<string, TimeSpan> MaintenanceWindows { get; set; } = new(StringComparer.OrdinalIgnoreCase)
    {
        ["weekday-cache-refresh"] = TimeSpan.FromMinutes(20),
        ["weekly-index-rebuild"] = TimeSpan.FromHours(2)
    };

    [OptionSetting("Telemetry Sample Rates", Description = "Scalar numeric dictionary for route-level telemetry sampling.")]
    public Dictionary<string, decimal> TelemetrySampleRates { get; set; } = new(StringComparer.OrdinalIgnoreCase)
    {
        ["/"] = 0.25m,
        ["/search"] = 1.0m,
        ["/admin"] = 0.5m
    };

    [OptionSetting("Weighted Promotion Tags", Description = "Duplicate entries are allowed; repeated tags increase their promotion weight.", AllowDuplicateListItems = true)]
    public List<string> WeightedPromotionTags { get; set; } = ["configuration", "configuration", "ui"];
}

public sealed class DemoPortalThemeOptions
{
    [Required]
    [RegularExpression("^(material|classic|compact)$")]
    [OptionSetting("Theme Key", Description = "Theme preset used by the documentation portal.")]
    public string ThemeKey { get; set; } = "material";

    [OptionSetting("Enable Table Of Contents", Description = "Whether markdown headings are rendered as a side navigation tree.")]
    public bool EnableTableOfContents { get; set; } = true;

    [Range(1, 6)]
    [OptionSetting("Max Heading Depth", Description = "Deepest markdown heading level included in the generated table of contents.")]
    public int MaxHeadingDepth { get; set; } = 4;

    [OptionSetting("Accent Colors", Description = "Enum scalar list for theme accent presets.")]
    public List<DemoPortalAccentColor> AccentColors { get; set; } = [DemoPortalAccentColor.Blue, DemoPortalAccentColor.Green];

    [OptionSetting("Css Variables", Description = "Scalar dictionary for demo-only CSS variable overrides.")]
    public Dictionary<string, string> CssVariables { get; set; } = new(StringComparer.OrdinalIgnoreCase)
    {
        ["--docs-sidebar-width"] = "280px",
        ["--docs-content-density"] = "comfortable"
    };
}

public sealed class DemoPortalSecurityOptions
{
    [Required]
    [OptionSetting("Authority", Description = "OIDC authority used by the demo portal.")]
    public string Authority { get; set; } = "https://identity.monica.local";

    [Required]
    [OptionSetting("Client Id", Description = "Public OIDC client id used by the documentation portal.")]
    public string ClientId { get; set; } = "monica-docs";

    [Required]
    [OptionSetting("Client Secret", Description = "Sensitive OIDC client secret used by confidential flows.", IsSensitive = true)]
    public string ClientSecret { get; set; } = "demo-secret";

    [OptionSetting("Metadata Refresh Interval", Description = "OIDC metadata refresh interval. This is read during startup and treated as static afterward.", ReloadBehavior = ConfigurationReloadBehavior.StaticAfterStartup)]
    public TimeSpan MetadataRefreshInterval { get; set; } = TimeSpan.FromHours(6);
}

public enum DemoDeploymentSlot
{
    Development,
    Staging,
    Production
}

public enum DemoPortalLocale
{
    ZhCn,
    EnUs,
    JaJp
}

public enum DemoPortalAccessMode
{
    ReadOnly,
    EditDrafts,
    Publish
}

public enum DemoPortalAccentColor
{
    Blue,
    Green,
    Amber,
    Rose
}
