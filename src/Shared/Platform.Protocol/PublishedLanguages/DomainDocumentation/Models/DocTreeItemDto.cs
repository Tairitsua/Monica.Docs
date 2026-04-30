namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;

/// <summary>
/// Represents one node in the documentation navigation tree.
/// </summary>
/// <param name="Title">The display title for the tree node.</param>
/// <param name="Path">The normalized relative source path.</param>
/// <param name="Slug">The document slug when the node points to a Markdown document.</param>
/// <param name="IsDocument">Whether the node is a readable document instead of a folder.</param>
/// <param name="Children">Child navigation nodes in display order.</param>
public sealed record DocTreeItemDto(
    string Title,
    string Path,
    string? Slug,
    bool IsDocument,
    IReadOnlyList<DocTreeItemDto> Children);
