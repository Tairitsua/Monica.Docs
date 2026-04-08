namespace Monica.Docs.Domains.Documentation.Models;

public sealed record DocumentationTreeNode(
    string Title,
    string RelativePath,
    string? Slug,
    bool IsDocument,
    int? Order,
    IReadOnlyList<DocumentationTreeNode> Children);
