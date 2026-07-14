namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;

/// <summary>
/// Contains the processed Markdown content and navigation metadata for one documentation page.
/// </summary>
/// <param name="Locale">The resolved document locale.</param>
/// <param name="Slug">The normalized document slug.</param>
/// <param name="Title">The resolved display title.</param>
/// <param name="RelativePath">The normalized relative source path.</param>
/// <param name="CanonicalPath">The locale-aware public website path for this document.</param>
/// <param name="Markdown">The processed Markdown content with local asset URLs rewritten.</param>
/// <param name="LastModifiedUtc">The last modified timestamp of the source file in UTC.</param>
/// <param name="Date">The optional publication date from document metadata.</param>
/// <param name="Tags">The document tags from front matter.</param>
/// <param name="Metadata">Additional front matter metadata preserved for consumers.</param>
/// <param name="Headings">Headings extracted from the processed Markdown content.</param>
/// <param name="Breadcrumbs">Breadcrumb entries for the document location.</param>
/// <param name="Alternates">Equivalent documents available in other locales.</param>
/// <param name="Previous">The previous document in navigation order, when available.</param>
/// <param name="Next">The next document in navigation order, when available.</param>
public sealed record DocContentDto(
    string Locale,
    string Slug,
    string Title,
    string RelativePath,
    string CanonicalPath,
    string Markdown,
    DateTime LastModifiedUtc,
    DateTime? Date,
    IReadOnlyList<string> Tags,
    IReadOnlyDictionary<string, object?> Metadata,
    IReadOnlyList<DocHeadingDto> Headings,
    IReadOnlyList<DocBreadcrumbDto> Breadcrumbs,
    IReadOnlyList<DocAlternateDto> Alternates,
    DocNavigationLinkDto? Previous,
    DocNavigationLinkDto? Next);
