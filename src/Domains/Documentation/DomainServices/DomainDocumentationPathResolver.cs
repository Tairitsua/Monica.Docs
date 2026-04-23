using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Monica.WebApi.Abstractions;

namespace Domains.Documentation.DomainServices;

/// <summary>
/// Resolves the markdown docs root for Monica.Docs across local development and mounted container deployments.
/// </summary>
public sealed class DomainDocumentationPathResolver(
    IHostEnvironment environment,
    IOptions<Configurations.DocumentationApiOptions> options)
    : DomainService
{
    private readonly Configurations.DocumentationApiOptions _options = options.Value;

    /// <summary>
    /// Resolves the best available docs base path.
    /// </summary>
    /// <exception cref="DirectoryNotFoundException">Thrown when no candidate docs directory exists.</exception>
    public string ResolveDocsBasePath()
    {
        foreach (var candidate in BuildCandidates())
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
            $"Unable to resolve the Monica.Docs markdown root. Checked configured path '{_options.DocsBasePath}', preferred mount '{_options.PreferredDocsMountPath}', and repository-relative docs folders from '{environment.ContentRootPath}'.");
    }

    private IEnumerable<string> BuildCandidates()
    {
        if (!string.IsNullOrWhiteSpace(_options.DocsBasePath))
        {
            yield return ResolveConfiguredPath(_options.DocsBasePath!);
        }

        if (!string.IsNullOrWhiteSpace(_options.PreferredDocsMountPath))
        {
            yield return _options.PreferredDocsMountPath;
        }

        yield return Path.Combine(environment.ContentRootPath, "docs");
        yield return Path.Combine(environment.ContentRootPath, "..", "..", "..", "docs");
    }

    private string ResolveConfiguredPath(string configuredPath)
    {
        if (Path.IsPathRooted(configuredPath))
        {
            return configuredPath;
        }

        return Path.Combine(environment.ContentRootPath, configuredPath);
    }
}
