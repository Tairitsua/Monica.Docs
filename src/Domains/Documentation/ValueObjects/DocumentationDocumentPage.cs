using Domains.Documentation.Entities;

namespace Domains.Documentation.ValueObjects;

/// <summary>
/// Combines a source document with its locale alternates and sequential navigation.
/// </summary>
public sealed record DocumentationDocumentPage(
    DocumentationSourceDocument Document,
    IReadOnlyList<DocumentationNavigationDocument> Alternates,
    DocumentationNavigationDocument? Previous,
    DocumentationNavigationDocument? Next);
