using Microsoft.Extensions.Hosting;

namespace Domains.Documentation.Utilities;

/// <summary>
/// Resolves the markdown docs root for Monica.Docs across local development and mounted container deployments.
/// </summary>
public static class UtilsDocumentationPathResolver
{
    /// <summary>
    /// Resolves the best available docs base path.
    /// </summary>
    /// <exception cref="DirectoryNotFoundException">Thrown when no candidate docs directory exists.</exception>
    public static string ResolveDocsBasePath(
        IHostEnvironment environment,
        Configurations.DocumentationApiOptions options)
    {
        foreach (var candidate in BuildCandidates(environment, options))
        {
            if (string.IsNullOrWhiteSpace(candidate))
            {
                continue;
            }

            var normalized = Path.GetFullPath(candidate);
            if (Directory.Exists(normalized))
            {
                return normalized;
            }
        }

        throw new DirectoryNotFoundException(
            $"Unable to resolve the Monica.Docs markdown root. Checked configured path '{options.DocsBasePath}', preferred mount '{options.PreferredDocsMountPath}', and repository-relative docs folders from '{environment.ContentRootPath}'.");
    }

    private static IEnumerable<string> BuildCandidates(
        IHostEnvironment environment,
        Configurations.DocumentationApiOptions options)
    {
        if (!string.IsNullOrWhiteSpace(options.DocsBasePath))
        {
            yield return ResolveConfiguredPath(environment, options.DocsBasePath!);
        }

        if (!string.IsNullOrWhiteSpace(options.PreferredDocsMountPath))
        {
            yield return options.PreferredDocsMountPath;
        }

        yield return Path.Combine(environment.ContentRootPath, "docs");
        yield return Path.Combine(environment.ContentRootPath, "..", "..", "..", "docs");
    }

    private static string ResolveConfiguredPath(
        IHostEnvironment environment,
        string configuredPath)
    {
        if (Path.IsPathRooted(configuredPath))
        {
            return configuredPath;
        }

        return Path.Combine(environment.ContentRootPath, configuredPath);
    }
}
