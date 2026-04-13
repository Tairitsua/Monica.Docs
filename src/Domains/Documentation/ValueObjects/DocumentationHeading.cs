namespace Domains.Documentation.ValueObjects;

public sealed record DocumentationHeading(
    string Id,
    string Title,
    int Level);
