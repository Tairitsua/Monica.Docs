namespace Domains.Documentation.ValueObjects;

/// <summary>
/// Identifies a localized document that can be used for alternate, previous, or next navigation.
/// </summary>
public sealed record DocumentationNavigationDocument(
    string Locale,
    string Slug,
    string Title);
