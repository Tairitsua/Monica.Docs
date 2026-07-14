using Monica.Configuration.Annotations;

namespace Domains.Documentation.Configurations;

[Configuration(SectionName, DisplayName = "Documentation API", Description = "Configures Monica.Docs document-group lookup, generated asset links, docs source resolution, and recurring catalog refresh.")]
public sealed class DocumentationApiOptions
{
    public const string SectionName = "DocumentationApi";
    public const string DefaultDocumentGroupKey = "monica";
    public const string DefaultLocale = "en-US";
    public const string DefaultAssetBasePath = "/api/v1/Documentation/assets";
    public const string DefaultDocsMountPath = "/docs";
    public const string DefaultDocsSyncCronExpression = "0 */5 * * * *";

    [OptionSetting("Document Group Key", Description = "Markdown document-group key used when loading the documentation catalog.")]
    public string DocumentGroupKey { get; set; } = DefaultDocumentGroupKey;

    [OptionSetting("Default Locale", Description = "BCP 47 culture used by unprefixed public documentation routes and locale metadata.")]
    public string DefaultCulture { get; set; } = DefaultLocale;

    [OptionSetting("Asset Base Path", Description = "Base HTTP path used when markdown assets are rewritten to Monica.Docs API links.")]
    public string AssetBasePath { get; set; } = DefaultAssetBasePath;

    [OptionSetting("Public API Base URL", Description = "Optional public origin used to generate absolute asset URLs. Relative asset URLs are emitted when this value is not configured.")]
    public Uri? PublicApiBaseUrl { get; set; }

    [OptionSetting("Docs Base Path", Description = "Optional absolute or host-relative path for the markdown docs root. When empty or missing, Monica.Docs falls back to /docs, then local repository docs folders.")]
    public string? DocsBasePath { get; set; }

    [OptionSetting("Preferred Docs Mount Path", Description = "Preferred container mount path checked before repository-relative fallbacks when Docs Base Path is not explicitly configured.")]
    public string PreferredDocsMountPath { get; set; } = DefaultDocsMountPath;

    [OptionSetting("Docs Sync Cron Expression", Description = "Configuration-sourced cron expression used by the recurring docs catalog sync job. Because Monica.Docs uses the in-memory JobScheduler provider in this demo host, startup bootstrap keeps the in-memory job definition aligned with this configured value.")]
    public string DocsSyncCronExpression { get; set; } = DefaultDocsSyncCronExpression;
}
