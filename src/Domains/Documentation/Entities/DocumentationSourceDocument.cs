namespace Domains.Documentation.Entities;

/// <summary>
/// Represents one localized source document resolved from the Markdown catalog.
/// </summary>
public sealed record DocumentationSourceDocument(
    string Locale,
    string Slug,
    string Title,
    string RelativePath,
    string NavigationRelativePath,
    string Markdown,
    DateTime LastModifiedUtc,
    DateTime? Date,
    IReadOnlyList<string> Tags,
    IReadOnlyDictionary<string, object?> Metadata);
