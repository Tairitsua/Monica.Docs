using Monica.Docs.Domains.Documentation.Models;

namespace Monica.Docs.Domains.Documentation.Interfaces;

public interface IRepositoryDocumentationContent
{
    Task<IReadOnlyList<DocumentationTreeNode>> GetTreeAsync(
        CancellationToken cancellationToken = default);

    Task<DocumentationSourceDocument?> GetDocumentBySlugAsync(
        string slug,
        CancellationToken cancellationToken = default);

    Task<DocumentationAsset?> GetAssetAsync(
        string assetPath,
        CancellationToken cancellationToken = default);
}
