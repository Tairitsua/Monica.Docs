namespace Monica.Docs.Domains.Documentation.Entities;

public sealed record DocumentationSourceDocument(
    string Slug,
    string Title,
    string RelativePath,
    string Markdown,
    DateTime LastModifiedUtc,
    DateTime? Date,
    IReadOnlyList<string> Tags,
    IReadOnlyDictionary<string, object?> Metadata);
