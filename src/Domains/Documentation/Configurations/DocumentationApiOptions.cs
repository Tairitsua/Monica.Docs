using Monica.Configuration.Annotations;

namespace Domains.Documentation.Configurations;

[Configuration(SectionName, Title = "Documentation API", Description = "Configures Monica.Docs document-group lookup and generated asset links.")]
public sealed class DocumentationApiOptions
{
    public const string SectionName = "DocumentationApi";
    public const string DefaultDocumentGroupKey = "monica";
    public const string DefaultAssetBasePath = "/api/docs/assets";

    [OptionSetting("Document Group Key", Description = "Markdown document-group key used when loading the documentation catalog.")]
    public string DocumentGroupKey { get; set; } = DefaultDocumentGroupKey;

    [OptionSetting("Asset Base Path", Description = "Base HTTP path used when markdown assets are rewritten to Monica.Docs API links.")]
    public string AssetBasePath { get; set; } = DefaultAssetBasePath;
}
