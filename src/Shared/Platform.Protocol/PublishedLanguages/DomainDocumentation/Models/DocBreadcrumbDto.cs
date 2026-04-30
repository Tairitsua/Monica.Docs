namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;

/// <summary>
/// Represents one breadcrumb entry for a documentation page.
/// </summary>
/// <param name="Title">The breadcrumb display title.</param>
/// <param name="Slug">The target document slug, or null for non-clickable folder entries.</param>
/// <param name="IsCurrent">Whether the entry represents the current document.</param>
public sealed record DocBreadcrumbDto(
    string Title,
    string? Slug,
    bool IsCurrent);
