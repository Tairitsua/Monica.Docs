using Domains.Documentation.Configurations;
using Domains.Documentation.Entities;
using Domains.Documentation.Interfaces;
using Domains.Documentation.Utilities;
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

    /// <inheritdoc />
    public async Task<IReadOnlyList<DocumentationLocale>> GetLocalesAsync(
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var group = await markdownCatalog.GetDocumentGroupAsync(_options.DocumentGroupKey);
        return group.Languages
            .Select(static language => new DocumentationLocale(
                language.Culture,
                language.DisplayName,
                language.DocumentCount))
            .ToList();
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<DocumentationTreeNode>?> GetTreeAsync(
        string locale,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var group = await markdownCatalog.GetDocumentGroupAsync(_options.DocumentGroupKey);
        var language = group.ResolveLanguage(locale);
        if (language is null)
        {
            return null;
        }

        return OrderNodes(group.GetDocumentTree(language.Culture).Children)
            .Select(node => MapNode(node, string.Empty))
            .ToList();
    }

    /// <inheritdoc />
    public async Task<DocumentationDocumentPage?> GetDocumentPageAsync(
        string locale,
        string slug,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var normalizedSlug = UtilsDocumentationPath.NormalizeSlug(slug);
        if (string.IsNullOrWhiteSpace(normalizedSlug))
        {
            return null;
        }

        var group = await markdownCatalog.GetDocumentGroupAsync(_options.DocumentGroupKey);
        var language = group.ResolveLanguage(locale);
        if (language is null)
        {
            return null;
        }

        var documents = group.GetDocuments(language.Culture);
        var document = documents.FirstOrDefault(candidate =>
            string.Equals(
                UtilsDocumentationPath.ToSlug(candidate.NavigationRelativePath),
                normalizedSlug,
                StringComparison.OrdinalIgnoreCase));

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

        var sourceDocument = new DocumentationSourceDocument(
            language.Culture,
            normalizedSlug,
            document.Title,
            UtilsDocumentationPath.NormalizeRelativePath(document.RelativePath),
            UtilsDocumentationPath.NormalizeRelativePath(document.NavigationRelativePath),
            markdown,
            document.LastModifiedUtc,
            document.FrontMatter?.Date,
            document.FrontMatter?.Tags?.ToList() ?? [],
            metadata);

        var orderedDocuments = EnumerateDocumentsInNavigationOrder(group, language.Culture).ToList();
        var currentIndex = orderedDocuments.FindIndex(candidate =>
            string.Equals(candidate.FilePath, document.FilePath, StringComparison.OrdinalIgnoreCase));

        return new DocumentationDocumentPage(
            sourceDocument,
            BuildAlternates(group, document),
            currentIndex > 0
                ? MapNavigationDocument(language.Culture, orderedDocuments[currentIndex - 1])
                : null,
            currentIndex >= 0 && currentIndex < orderedDocuments.Count - 1
                ? MapNavigationDocument(language.Culture, orderedDocuments[currentIndex + 1])
                : null);
    }

    /// <inheritdoc />
    public async Task<DocumentationAsset?> GetAssetAsync(
        string assetPath,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var normalizedAssetPath = UtilsDocumentationPath.NormalizeRelativePath(
            Uri.UnescapeDataString(assetPath));

        if (!UtilsDocumentationPath.IsPublicAssetPath(normalizedAssetPath))
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

        var fileInfo = new FileInfo(candidatePath);
        return new DocumentationAsset(
            candidatePath,
            contentType,
            fileInfo.Length,
            fileInfo.LastWriteTimeUtc);
    }

    private static DocumentationTreeNode MapNode(
        Monica.Tool.Algorithms.Trees.TreeNode<MarkdownDocumentNodeData> node,
        string currentPath)
    {
        var relativePath = node.Data.IsDocument && node.Data.Document is not null
            ? UtilsDocumentationPath.NormalizeRelativePath(node.Data.Document.NavigationRelativePath)
            : CombinePath(currentPath, node.Data.Name);

        var children = OrderNodes(node.Children)
            .Select(child => MapNode(child, relativePath))
            .ToList();

        return new DocumentationTreeNode(
            node.Data.ResolvedDisplayName,
            relativePath,
            node.Data.IsDocument && node.Data.Document is not null
                ? UtilsDocumentationPath.ToSlug(node.Data.Document.NavigationRelativePath)
                : null,
            node.Data.IsDocument,
            node.Data.NavigationOrder,
            children);
    }

    private static IEnumerable<Monica.Tool.Algorithms.Trees.TreeNode<MarkdownDocumentNodeData>> OrderNodes(
        IEnumerable<Monica.Tool.Algorithms.Trees.TreeNode<MarkdownDocumentNodeData>> nodes)
    {
        return nodes
            .OrderBy(static node => node.Data.NavigationOrder.HasValue ? 0 : 1)
            .ThenBy(static node => node.Data.NavigationOrder)
            .ThenBy(static node => node.Data.IsDocument ? 1 : 0)
            .ThenBy(static node => node.Data.ResolvedDisplayName, StringComparer.OrdinalIgnoreCase);
    }

    private static IEnumerable<MarkdownDocument> EnumerateDocumentsInNavigationOrder(
        MarkdownDocumentGroup group,
        string locale)
    {
        return EnumerateDocuments(group.GetDocumentTree(locale));
    }

    private static IEnumerable<MarkdownDocument> EnumerateDocuments(
        Monica.Tool.Algorithms.Trees.TreeNode<MarkdownDocumentNodeData> node)
    {
        foreach (var child in OrderNodes(node.Children))
        {
            if (child.Data.IsDocument && child.Data.Document is not null)
            {
                yield return child.Data.Document;
            }

            foreach (var descendant in EnumerateDocuments(child))
            {
                yield return descendant;
            }
        }
    }

    private static IReadOnlyList<DocumentationNavigationDocument> BuildAlternates(
        MarkdownDocumentGroup group,
        MarkdownDocument document)
    {
        return group.Languages
            .Where(language => !string.Equals(
                language.Culture,
                document.Culture,
                StringComparison.OrdinalIgnoreCase))
            .Select(language => (Language: language, Document: group.FindDocument(
                document.NavigationRelativePath,
                language.Culture)))
            .Where(static candidate => candidate.Document is not null)
            .Select(static candidate => MapNavigationDocument(
                candidate.Language.Culture,
                candidate.Document!))
            .ToList();
    }

    private static DocumentationNavigationDocument MapNavigationDocument(
        string locale,
        MarkdownDocument document)
    {
        return new DocumentationNavigationDocument(
            locale,
            UtilsDocumentationPath.ToSlug(document.NavigationRelativePath),
            document.Title);
    }

    private static string CombinePath(string prefix, string name)
    {
        if (string.IsNullOrWhiteSpace(prefix))
        {
            return UtilsDocumentationPath.NormalizeRelativePath(name);
        }

        return UtilsDocumentationPath.NormalizeRelativePath($"{prefix}/{name}");
    }

    private static bool IsOutsideGroupRoot(string groupBasePath, string candidatePath)
    {
        var relative = Path.GetRelativePath(groupBasePath, candidatePath);
        return relative.StartsWith("..", StringComparison.Ordinal)
               || Path.IsPathRooted(relative);
    }
}
