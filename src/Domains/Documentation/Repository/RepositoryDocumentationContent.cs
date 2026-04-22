using Domains.Documentation.Configurations;
using Domains.Documentation.Entities;
using Domains.Documentation.Interfaces;
using Domains.Documentation.Utils;
using Domains.Documentation.ValueObjects;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Monica.DependencyInjection.Annotations;
using Monica.Markdown.Abstractions;
using Monica.Markdown.Models;

namespace Domains.Documentation.Repository;

[Dependency(ServiceLifetime.Transient)]
public sealed class RepositoryDocumentationContent(
    IMarkdownDocumentCatalog markdownCatalog,
    IOptions<DocumentationApiOptions> options)
    : IRepositoryDocumentationContent
{
    private static readonly FileExtensionContentTypeProvider ContentTypeProvider = new();
    private readonly DocumentationApiOptions _options = options.Value;

    public async Task<IReadOnlyList<DocumentationTreeNode>> GetTreeAsync(
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var group = await markdownCatalog.GetDocumentGroupAsync(_options.DocumentGroupKey);
        return group.RootNode.Children
            .Select(node => MapNode(node, string.Empty))
            .ToList();
    }

    public async Task<DocumentationSourceDocument?> GetDocumentBySlugAsync(
        string slug,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var normalizedSlug = DocumentationPathUtils.NormalizeSlug(slug);
        if (string.IsNullOrWhiteSpace(normalizedSlug))
        {
            return null;
        }

        var documents = await markdownCatalog.GetDocumentsAsync(_options.DocumentGroupKey);
        var document = documents.FirstOrDefault(candidate =>
            string.Equals(
                DocumentationPathUtils.ToSlug(candidate.RelativePath),
                normalizedSlug,
                StringComparison.Ordinal));

        if (document is null)
        {
            return null;
        }

        var markdown = await markdownCatalog.GetDocumentContentAsync(document);
        var metadata = document.FrontMatter?.RawMetadata is null
            ? new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase)
            : new Dictionary<string, object?>(
                document.FrontMatter.RawMetadata,
                StringComparer.OrdinalIgnoreCase);

        return new DocumentationSourceDocument(
            normalizedSlug,
            document.Title,
            DocumentationPathUtils.NormalizeRelativePath(document.RelativePath),
            markdown,
            document.LastModifiedUtc,
            document.FrontMatter?.Date,
            document.FrontMatter?.Tags?.ToList() ?? [],
            metadata);
    }

    public async Task<DocumentationAsset?> GetAssetAsync(
        string assetPath,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var normalizedAssetPath = DocumentationPathUtils.NormalizeRelativePath(
            Uri.UnescapeDataString(assetPath));

        if (string.IsNullOrWhiteSpace(normalizedAssetPath)
            || DocumentationPathUtils.IsMarkdownDocumentPath(normalizedAssetPath))
        {
            return null;
        }

        var group = await markdownCatalog.GetDocumentGroupAsync(_options.DocumentGroupKey);
        if (!group.IsValid)
        {
            return null;
        }

        var groupBasePath = Path.GetFullPath(group.BasePath);
        var candidatePath = Path.GetFullPath(
            Path.Combine(
                groupBasePath,
                normalizedAssetPath.Replace('/', Path.DirectorySeparatorChar)));

        if (IsOutsideGroupRoot(groupBasePath, candidatePath) || !File.Exists(candidatePath))
        {
            return null;
        }

        if (!ContentTypeProvider.TryGetContentType(candidatePath, out var contentType))
        {
            contentType = "application/octet-stream";
        }

        return new DocumentationAsset(candidatePath, contentType);
    }

    private static DocumentationTreeNode MapNode(
        Monica.Tool.Algorithms.Trees.TreeNode<MarkdownDocumentNodeData> node,
        string currentPath)
    {
        var relativePath = node.Data.IsDocument && node.Data.Document is not null
            ? DocumentationPathUtils.NormalizeRelativePath(node.Data.Document.RelativePath)
            : CombinePath(currentPath, node.Data.Name);

        var children = node.Children
            .Select(child => MapNode(child, relativePath))
            .OrderBy(child => child.Order.HasValue ? 0 : 1)
            .ThenBy(child => child.Order)
            .ThenBy(child => child.IsDocument ? 1 : 0)
            .ThenBy(child => child.Title, StringComparer.OrdinalIgnoreCase)
            .ToList();

        return new DocumentationTreeNode(
            node.Data.ResolvedDisplayName,
            relativePath,
            node.Data.IsDocument && node.Data.Document is not null
                ? DocumentationPathUtils.ToSlug(node.Data.Document.RelativePath)
                : null,
            node.Data.IsDocument,
            node.Data.NavigationOrder,
            children);
    }

    private static string CombinePath(string prefix, string name)
    {
        if (string.IsNullOrWhiteSpace(prefix))
        {
            return DocumentationPathUtils.NormalizeRelativePath(name);
        }

        return DocumentationPathUtils.NormalizeRelativePath($"{prefix}/{name}");
    }

    private static bool IsOutsideGroupRoot(string groupBasePath, string candidatePath)
    {
        var relative = Path.GetRelativePath(groupBasePath, candidatePath);
        return relative.StartsWith("..", StringComparison.Ordinal)
               || Path.IsPathRooted(relative);
    }
}
