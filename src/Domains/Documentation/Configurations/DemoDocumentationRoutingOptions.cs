using System.ComponentModel.DataAnnotations;
using Monica.Configuration.Annotations;
using Monica.Configuration.Models;

namespace Domains.Documentation.Configurations;

[Configuration(SectionName,
    DefinitionKey = "docs.routing.demo",
    DisplayName = "Docs Routing Demo",
    Description = "Demonstrates dictionary configuration where each service owns nested route, database, and feature settings.",
    Category = "Documentation Demo",
    ReloadBehavior = ConfigurationReloadBehavior.OnlineReloadable)]
public sealed class DemoDocumentationRoutingOptions
{
    public const string SectionName = "Demo:DocumentationRouting";

    [OptionSetting("Default Service", Description = "Service key used when a request does not match a more specific route.")]
    public string DefaultService { get; set; } = "docs";

    [OptionSetting("Services", Description = "Dictionary keyed by service name. Each value is a nested service options object.")]
    public Dictionary<string, DemoDocumentationServiceOptions> Services { get; set; } = new(StringComparer.OrdinalIgnoreCase)
    {
        ["docs"] = new()
        {
            DisplayName = "Documentation",
            Endpoint = new Uri("https://docs.internal.local"),
            ConnectedDbs =
            [
                new DemoConnectedDbOptions
                {
                    Name = "catalog",
                    Provider = "PostgreSQL",
                    ConnectionString = "Host=localhost;Database=docs_catalog;",
                    TimeoutSeconds = 30
                },
                new DemoConnectedDbOptions
                {
                    Name = "search",
                    Provider = "Redis",
                    ConnectionString = "redis://localhost:6379/2",
                    TimeoutSeconds = 5
                }
            ],
            FeatureFlags = new Dictionary<string, bool>(StringComparer.OrdinalIgnoreCase)
            {
                ["semantic-search"] = true,
                ["draft-preview"] = false
            },
            EnabledModules = [DemoDocumentationServiceModule.Catalog, DemoDocumentationServiceModule.Search],
            RateLimits = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
            {
                ["anonymous"] = 60,
                ["authenticated"] = 600
            },
            ResponseHeaders = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["x-docs-service"] = "catalog",
                ["cache-control"] = "public,max-age=120"
            }
        },
        ["admin"] = new()
        {
            DisplayName = "Admin Console",
            Endpoint = new Uri("https://admin.internal.local"),
            ConnectedDbs =
            [
                new DemoConnectedDbOptions
                {
                    Name = "audit",
                    Provider = "SqlServer",
                    ConnectionString = "Server=localhost;Database=docs_audit;",
                    TimeoutSeconds = 20
                }
            ],
            FeatureFlags = new Dictionary<string, bool>(StringComparer.OrdinalIgnoreCase)
            {
                ["bulk-publish"] = true,
                ["danger-zone"] = false
            },
            EnabledModules = [DemoDocumentationServiceModule.Admin, DemoDocumentationServiceModule.Audit],
            RateLimits = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
            {
                ["operator"] = 240,
                ["admin"] = 900
            },
            ResponseHeaders = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["x-docs-service"] = "admin",
                ["cache-control"] = "private,no-store"
            }
        }
    };
}

public sealed class DemoDocumentationServiceOptions
{
    [Required]
    [OptionSetting("Display Name", Description = "Operator-facing name for this routed service.")]
    public string DisplayName { get; set; } = string.Empty;

    [OptionSetting("Endpoint", Description = "Internal endpoint used by the docs gateway.")]
    public Uri Endpoint { get; set; } = new("https://service.internal.local");

    [OptionSetting("Enabled", Description = "Whether this service participates in route resolution.")]
    public bool Enabled { get; set; } = true;

    [Range(1, 100)]
    [OptionSetting("Weight", Description = "Relative route weight used by the demo gateway.")]
    public int Weight { get; set; } = 10;

    [OptionSetting("Connected Databases", Description = "Stable-key list of databases used by this service.")]
    public List<DemoConnectedDbOptions> ConnectedDbs { get; set; } = [];

    [OptionSetting("Feature Flags", Description = "Dictionary of runtime feature flags for this service.")]
    public Dictionary<string, bool> FeatureFlags { get; set; } = new(StringComparer.OrdinalIgnoreCase);

    [OptionSetting("Enabled Modules", Description = "Enum scalar list nested inside a service dictionary value.")]
    public List<DemoDocumentationServiceModule> EnabledModules { get; set; } = [];

    [OptionSetting("Rate Limits", Description = "Scalar integer dictionary nested inside a service dictionary value.")]
    public Dictionary<string, int> RateLimits { get; set; } = new(StringComparer.OrdinalIgnoreCase);

    [OptionSetting("Response Headers", Description = "Scalar string dictionary nested inside a service dictionary value.")]
    public Dictionary<string, string> ResponseHeaders { get; set; } = new(StringComparer.OrdinalIgnoreCase);
}

public sealed class DemoConnectedDbOptions
{
    [Required]
    [RegularExpression("^[a-z][a-z0-9-]{1,31}$")]
    [OptionSetting("Name", Description = "Stable identity for the database list item.", IsListItemKey = true)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^(SqlServer|PostgreSQL|MySQL|Redis)$")]
    [OptionSetting("Provider", Description = "Database provider used by this connection.")]
    public string Provider { get; set; } = "PostgreSQL";

    [Required]
    [OptionSetting("Connection String", Description = "Sensitive database connection string.", IsSensitive = true)]
    public string ConnectionString { get; set; } = string.Empty;

    [Range(1, 120)]
    [OptionSetting("Timeout Seconds", Description = "Command timeout used by this connection.")]
    public int TimeoutSeconds { get; set; } = 30;

    [OptionSetting("Replica Hosts", Description = "Scalar list nested inside a stable-key list item.")]
    public List<string> ReplicaHosts { get; set; } = ["primary.internal.local"];

    [OptionSetting("Pool Limits", Description = "Scalar integer dictionary nested inside a stable-key list item.")]
    public Dictionary<string, int> PoolLimits { get; set; } = new(StringComparer.OrdinalIgnoreCase)
    {
        ["min"] = 1,
        ["max"] = 20
    };
}

public enum DemoDocumentationServiceModule
{
    Catalog,
    Search,
    Admin,
    Audit,
    Preview
}
