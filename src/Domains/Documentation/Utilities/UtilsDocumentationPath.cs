namespace Domains.Documentation.Utilities;

public static class UtilsDocumentationPath
{
    private static readonly char[] QueryOrFragmentSeparators = ['?', '#'];

    public static string NormalizeRelativePath(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        return value
            .Replace('\\', '/')
            .Trim()
            .TrimStart('/');
    }

    public static string NormalizeSlug(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var decoded = Uri.UnescapeDataString(value.Trim());
        var normalized = NormalizeRelativePath(decoded).Trim('/');
        if (normalized.EndsWith(".markdown", StringComparison.OrdinalIgnoreCase))
        {
            normalized = normalized[..^".markdown".Length];
        }
        else if (normalized.EndsWith(".md", StringComparison.OrdinalIgnoreCase))
        {
            normalized = normalized[..^".md".Length];
        }

        if (string.IsNullOrWhiteSpace(normalized))
        {
            return string.Empty;
        }

        return string.Join(
            "/",
            normalized
                .Split('/', StringSplitOptions.RemoveEmptyEntries)
                .Select(static segment => segment.Trim().ToLowerInvariant()));
    }

    public static string ToSlug(string relativePath)
    {
        var normalizedPath = NormalizeRelativePath(relativePath);
        if (normalizedPath.EndsWith(".markdown", StringComparison.OrdinalIgnoreCase))
        {
            normalizedPath = normalizedPath[..^".markdown".Length];
        }
        else if (normalizedPath.EndsWith(".md", StringComparison.OrdinalIgnoreCase))
        {
            normalizedPath = normalizedPath[..^".md".Length];
        }

        return NormalizeSlug(normalizedPath);
    }

    public static bool IsMarkdownDocumentPath(string path)
    {
        var normalized = NormalizeRelativePath(StripQueryAndFragment(path));
        return normalized.EndsWith(".md", StringComparison.OrdinalIgnoreCase)
               || normalized.EndsWith(".markdown", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Determines whether a repository-relative file path is eligible for public asset delivery.
    /// </summary>
    /// <remarks>
    /// Hidden authoring folders and build/dependency directories are never public assets, even when they live below
    /// the configured documentation root. Markdown source is delivered through the document API instead.
    /// </remarks>
    public static bool IsPublicAssetPath(string? path)
    {
        var normalizedPath = NormalizeRelativePath(path);
        if (string.IsNullOrWhiteSpace(normalizedPath) || IsMarkdownDocumentPath(normalizedPath))
        {
            return false;
        }

        return normalizedPath
            .Split('/', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .All(static segment => !IsPrivateAssetSegment(segment));
    }

    public static bool TryResolveLocalAssetPath(
        string currentDocumentRelativePath,
        string referencePath,
        out string assetRelativePath)
    {
        assetRelativePath = string.Empty;
        if (!TryResolveRelativeTarget(currentDocumentRelativePath, referencePath, out var resolvedPath))
        {
            return false;
        }

        if (!IsPublicAssetPath(resolvedPath))
        {
            return false;
        }

        assetRelativePath = resolvedPath;
        return true;
    }

    public static string BuildAssetUrl(
        string assetBasePath,
        string assetRelativePath,
        Uri? publicApiBaseUrl = null)
    {
        var normalizedBasePath = string.IsNullOrWhiteSpace(assetBasePath)
            ? "/api/v1/Documentation/assets"
            : assetBasePath.Trim();

        if (!normalizedBasePath.StartsWith('/'))
        {
            normalizedBasePath = "/" + normalizedBasePath;
        }

        normalizedBasePath = normalizedBasePath.TrimEnd('/');

        var encodedPath = Uri.EscapeDataString(NormalizeRelativePath(assetRelativePath));
        var separator = normalizedBasePath.Contains('?', StringComparison.Ordinal) ? '&' : '?';

        var relativeUrl = $"{normalizedBasePath}{separator}assetPath={encodedPath}";
        return publicApiBaseUrl is null
            ? relativeUrl
            : new Uri(publicApiBaseUrl, relativeUrl).AbsoluteUri;
    }

    public static string BuildPublicDocumentPath(
        string locale,
        string slug,
        string defaultLocale)
    {
        var normalizedSlug = NormalizeSlug(slug);
        var publicSlug = normalizedSlug.EndsWith("/index", StringComparison.OrdinalIgnoreCase)
            ? normalizedSlug[..^"/index".Length]
            : normalizedSlug;
        var docsPath = string.IsNullOrEmpty(publicSlug)
                       || string.Equals(publicSlug, "index", StringComparison.OrdinalIgnoreCase)
            ? "/docs"
            : $"/docs/{publicSlug}";

        return string.Equals(locale, defaultLocale, StringComparison.OrdinalIgnoreCase)
            ? docsPath
            : $"/{locale}{docsPath}";
    }

    private static bool TryResolveRelativeTarget(
        string currentDocumentRelativePath,
        string referencePath,
        out string resolvedRelativePath)
    {
        resolvedRelativePath = string.Empty;

        if (string.IsNullOrWhiteSpace(referencePath))
        {
            return false;
        }

        var trimmedReference = referencePath.Trim();
        if (trimmedReference.StartsWith('#')
            || trimmedReference.StartsWith('/')
            || trimmedReference.StartsWith("//", StringComparison.Ordinal)
            || Path.IsPathRooted(trimmedReference)
            || Uri.TryCreate(trimmedReference, UriKind.Absolute, out _))
        {
            return false;
        }

        var candidatePath = NormalizeRelativePath(
            Uri.UnescapeDataString(StripQueryAndFragment(trimmedReference)));

        if (string.IsNullOrWhiteSpace(candidatePath))
        {
            return false;
        }

        var currentDirectory = Path.GetDirectoryName(
                                   NormalizeRelativePath(currentDocumentRelativePath)
                                       .Replace('/', Path.DirectorySeparatorChar))
                               ?? string.Empty;

        var docsRoot = Path.GetFullPath(Path.DirectorySeparatorChar.ToString());
        var combinedPath = Path.GetFullPath(
            Path.Combine(
                docsRoot,
                currentDirectory,
                candidatePath.Replace('/', Path.DirectorySeparatorChar)));

        var relativeToRoot = NormalizeRelativePath(Path.GetRelativePath(docsRoot, combinedPath));
        if (relativeToRoot.StartsWith("..", StringComparison.Ordinal))
        {
            return false;
        }

        resolvedRelativePath = relativeToRoot;
        return true;
    }

    private static string StripQueryAndFragment(string value)
    {
        var splitIndex = value.IndexOfAny(QueryOrFragmentSeparators);
        return splitIndex >= 0
            ? value[..splitIndex]
            : value;
    }

    private static bool IsPrivateAssetSegment(string segment)
    {
        return segment.StartsWith('.')
               || segment.Equals("bin", StringComparison.OrdinalIgnoreCase)
               || segment.Equals("obj", StringComparison.OrdinalIgnoreCase)
               || segment.Equals("node_modules", StringComparison.OrdinalIgnoreCase)
               || segment.Equals("packages", StringComparison.OrdinalIgnoreCase);
    }
}
