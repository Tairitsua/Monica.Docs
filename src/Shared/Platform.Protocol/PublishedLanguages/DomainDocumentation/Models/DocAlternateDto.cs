namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;

/// <summary>
/// Identifies an equivalent documentation page in another locale.
/// </summary>
/// <param name="Locale">The alternate document locale.</param>
/// <param name="Slug">The locale-relative document slug.</param>
/// <param name="Title">The alternate document title.</param>
/// <param name="Path">The public website path for the alternate document.</param>
public sealed record DocAlternateDto(
    string Locale,
    string Slug,
    string Title,
    string Path);
