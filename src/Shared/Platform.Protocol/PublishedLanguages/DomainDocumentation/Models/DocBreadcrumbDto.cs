namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;

public sealed record DocBreadcrumbDto(
    string Title,
    string? Slug,
    bool IsCurrent);
