using Domains.Documentation.Configurations;
using Domains.Documentation.DomainServices;
using Domains.Documentation.Entities;
using Domains.Documentation.Interfaces;
using Domains.Documentation.ValueObjects;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Options;
using Monica.Markdown.Abstractions;
using Monica.Markdown.Models;

namespace Domains.Documentation.Repository;

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

        var normalizedSlug = DomainDocumentationPathRules.NormalizeSlug(slug);
        if (string.IsNullOrWhiteSpace(normalizedSlug))
        {
            return null;
        }

        var documents = await markdownCatalog.GetDocumentsAsync(_options.DocumentGroupKey);
        var document = documents.FirstOrDefault(candidate =>
            string.Equals(
                DomainDocumentationPathRules.ToSlug(candidate.RelativePath),
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
            DomainDocumentationPathRules.NormalizeRelativePath(document.RelativePath),
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

        var normalizedAssetPath = DomainDocumentationPathRules.NormalizeRelativePath(
            Uri.UnescapeDataString(assetPath));

        if (string.IsNullOrWhiteSpace(normalizedAssetPath)
            || DomainDocumentationPathRules.IsMarkdownDocumentPath(normalizedAssetPath))
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
            ? DomainDocumentationPathRules.NormalizeRelativePath(node.Data.Document.RelativePath)
            : CombinePath(currentPath, node.Data.Name);

        var children = node.Children
            .Select(child => MapNode(child, relativePath))
            .OrderBy(child => child.IsDocument ? 1 : 0)
            .ThenBy(child => child.Order ?? int.MaxValue)
            .ThenBy(child => child.Title, StringComparer.OrdinalIgnoreCase)
            .ToList();

        return new DocumentationTreeNode(
            node.Data.IsDocument && node.Data.Document is not null
                ? node.Data.Document.Title
                : node.Data.Name,
            relativePath,
            node.Data.IsDocument && node.Data.Document is not null
                ? DomainDocumentationPathRules.ToSlug(node.Data.Document.RelativePath)
                : null,
            node.Data.IsDocument,
            TryGetSidebarOrder(node.Data.Document),
            children);
    }

    private static string CombinePath(string prefix, string name)
    {
        if (string.IsNullOrWhiteSpace(prefix))
        {
            return DomainDocumentationPathRules.NormalizeRelativePath(name);
        }

        return DomainDocumentationPathRules.NormalizeRelativePath($"{prefix}/{name}");
    }

    private static int? TryGetSidebarOrder(MarkdownDocument? document)
    {
        if (document?.FrontMatter?.RawMetadata is null
            || !document.FrontMatter.RawMetadata.TryGetValue("sidebar_position", out var rawValue)
            || rawValue is null)
        {
            return null;
        }

        return rawValue switch
        {
            int intValue => intValue,
            long longValue => checked((int)longValue),
            string stringValue when int.TryParse(stringValue, out var parsedValue) => parsedValue,
            _ => null
        };
    }

    private static bool IsOutsideGroupRoot(string groupBasePath, string candidatePath)
    {
        var relative = Path.GetRelativePath(groupBasePath, candidatePath);
        return relative.StartsWith("..", StringComparison.Ordinal)
               || Path.IsPathRooted(relative);
    }
}
