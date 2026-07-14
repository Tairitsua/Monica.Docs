using Domains.Documentation.ValueObjects;

namespace Domains.Documentation.Interfaces;

/// <summary>
/// Reads localized documentation navigation, content, and assets from the configured catalog.
/// </summary>
public interface IRepositoryDocumentationContent
{
    /// <summary>
    /// Gets the locales discovered in the configured document group.
    /// </summary>
    Task<IReadOnlyList<DocumentationLocale>> GetLocalesAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a locale-relative navigation tree, or <see langword="null"/> when the locale is unsupported.
    /// </summary>
    Task<IReadOnlyList<DocumentationTreeNode>?> GetTreeAsync(
        string locale,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a localized document page by its locale-relative slug.
    /// </summary>
    Task<DocumentationDocumentPage?> GetDocumentPageAsync(
        string locale,
        string slug,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a non-Markdown asset by its source-relative path.
    /// </summary>
    Task<DocumentationAsset?> GetAssetAsync(
        string assetPath,
        CancellationToken cancellationToken = default);
}
