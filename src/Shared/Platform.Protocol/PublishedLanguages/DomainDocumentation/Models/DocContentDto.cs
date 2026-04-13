namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;

public sealed record DocContentDto(
    string Slug,
    string Title,
    string RelativePath,
    string Markdown,
    DateTime LastModifiedUtc,
    DateTime? Date,
    IReadOnlyList<string> Tags,
    IReadOnlyDictionary<string, object?> Metadata,
    IReadOnlyList<DocHeadingDto> Headings,
    IReadOnlyList<DocBreadcrumbDto> Breadcrumbs);
