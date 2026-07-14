namespace Domains.Documentation.ValueObjects;

/// <summary>
/// Describes one locale discovered in the configured multilingual documentation group.
/// </summary>
public sealed record DocumentationLocale(
    string Culture,
    string DisplayName,
    int DocumentCount);
