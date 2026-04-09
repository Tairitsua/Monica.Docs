namespace Monica.Docs.Domains.Documentation.DomainServices;

public static class DomainDocumentationPathRules
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

        if (IsMarkdownDocumentPath(resolvedPath))
        {
            return false;
        }

        assetRelativePath = resolvedPath;
        return true;
    }

    public static string BuildAssetUrl(string assetBasePath, string assetRelativePath)
    {
        var normalizedBasePath = string.IsNullOrWhiteSpace(assetBasePath)
            ? "/api/docs/assets"
            : assetBasePath.Trim();

        if (!normalizedBasePath.StartsWith('/'))
        {
            normalizedBasePath = "/" + normalizedBasePath;
        }

        normalizedBasePath = normalizedBasePath.TrimEnd('/');

        var encodedPath = string.Join(
            "/",
            NormalizeRelativePath(assetRelativePath)
                .Split('/', StringSplitOptions.RemoveEmptyEntries)
                .Select(Uri.EscapeDataString));

        return $"{normalizedBasePath}/{encodedPath}";
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
}
