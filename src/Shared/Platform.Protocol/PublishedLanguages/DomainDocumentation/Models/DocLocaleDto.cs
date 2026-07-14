namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;

/// <summary>
/// Describes one locale exposed by the public documentation API.
/// </summary>
/// <param name="Culture">The BCP 47 culture name.</param>
/// <param name="DisplayName">The human-readable culture name.</param>
/// <param name="DocumentCount">The number of documents available in this locale.</param>
/// <param name="IsDefault">Whether this is the default locale used by unprefixed website routes.</param>
public sealed record DocLocaleDto(
    string Culture,
    string DisplayName,
    int DocumentCount,
    bool IsDefault);
