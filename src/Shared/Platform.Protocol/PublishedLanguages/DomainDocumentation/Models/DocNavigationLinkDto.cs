namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;

/// <summary>
/// Identifies an adjacent document in the locale-specific navigation order.
/// </summary>
/// <param name="Slug">The locale-relative document slug.</param>
/// <param name="Title">The document title.</param>
/// <param name="Path">The public website path for the document.</param>
public sealed record DocNavigationLinkDto(
    string Slug,
    string Title,
    string Path);
