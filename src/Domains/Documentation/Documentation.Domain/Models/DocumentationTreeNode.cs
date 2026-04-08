namespace Monica.Docs.Domains.Documentation.Domain.Models;

public sealed record DocumentationTreeNode(
    string Title,
    string RelativePath,
    string? Slug,
    bool IsDocument,
    int? Order,
    IReadOnlyList<DocumentationTreeNode> Children);
