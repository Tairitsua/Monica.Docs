namespace Domains.Documentation.ValueObjects;

public sealed record DocumentationProcessedDocument(
    string Markdown,
    IReadOnlyList<DocumentationHeading> Headings);
