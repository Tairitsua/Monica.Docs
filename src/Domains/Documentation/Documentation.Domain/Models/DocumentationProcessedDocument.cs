namespace Monica.Docs.Domains.Documentation.Domain.Models;

public sealed record DocumentationProcessedDocument(
    string Markdown,
    IReadOnlyList<DocumentationHeading> Headings);
