namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;

public sealed record DocTreeItemDto(
    string Title,
    string Path,
    string? Slug,
    bool IsDocument,
    IReadOnlyList<DocTreeItemDto> Children);
