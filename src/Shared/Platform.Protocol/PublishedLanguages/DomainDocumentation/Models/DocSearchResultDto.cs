namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;

/// <summary>
/// Represents one locale-scoped full-text documentation search result.
/// </summary>
/// <param name="Locale">The locale containing the matched document.</param>
/// <param name="Slug">The locale-relative document slug.</param>
/// <param name="Title">The matched document title.</param>
/// <param name="Path">The public website path for the document.</param>
/// <param name="PathTrail">The optional navigation path displayed with the result.</param>
/// <param name="SectionTitle">The optional matched section title.</param>
/// <param name="PreviewText">A compact text excerpt surrounding the match.</param>
/// <param name="PreviewHighlights">Match ranges within <paramref name="PreviewText"/>.</param>
/// <param name="AnchorId">The optional heading anchor for the strongest match.</param>
/// <param name="Score">The relevance score assigned by the Markdown search provider.</param>
public sealed record DocSearchResultDto(
    string Locale,
    string Slug,
    string Title,
    string Path,
    string? PathTrail,
    string? SectionTitle,
    string PreviewText,
    IReadOnlyList<DocSearchMatchDto> PreviewHighlights,
    string? AnchorId,
    double Score);
