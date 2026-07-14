namespace Domains.Documentation.ValueObjects;

/// <summary>
/// Describes a documentation asset that can be served by the public API.
/// </summary>
public sealed record DocumentationAsset(
    string FilePath,
    string ContentType,
    long Length,
    DateTime LastModifiedUtc);
