namespace Monica.Docs.Domains.Documentation.Infrastructure.Configurations;

public sealed class DocumentationApiOptions
{
    public const string SectionName = "DocumentationApi";
    public const string DefaultDocumentGroupKey = "monica";
    public const string DefaultAssetBasePath = "/api/docs/assets";

    public string DocumentGroupKey { get; set; } = DefaultDocumentGroupKey;

    public string AssetBasePath { get; set; } = DefaultAssetBasePath;
}
