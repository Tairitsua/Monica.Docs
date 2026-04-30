namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;

/// <summary>
/// Represents a Markdown heading extracted from a documentation page.
/// </summary>
/// <param name="Id">The stable heading anchor identifier.</param>
/// <param name="Title">The visible heading text.</param>
/// <param name="Level">The Markdown heading level.</param>
public sealed record DocHeadingDto(
    string Id,
    string Title,
    int Level);
