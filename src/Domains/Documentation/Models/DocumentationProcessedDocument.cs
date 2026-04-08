namespace Monica.Docs.Domains.Documentation.Models;

public sealed record DocumentationProcessedDocument(
    string Markdown,
    IReadOnlyList<DocumentationHeading> Headings);
