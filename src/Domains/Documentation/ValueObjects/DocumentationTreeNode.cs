namespace Domains.Documentation.ValueObjects;

public sealed record DocumentationTreeNode(
    string Title,
    string RelativePath,
    string? Slug,
    bool IsDocument,
    int? Order,
    IReadOnlyList<DocumentationTreeNode> Children);
