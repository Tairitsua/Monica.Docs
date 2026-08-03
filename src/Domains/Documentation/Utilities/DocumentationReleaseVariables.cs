using System.Reflection;
using Monica.Core;

namespace Domains.Documentation.Utilities;

internal static class DocumentationReleaseVariables
{
    private const string MONICA_VERSION_TOKEN = "{{monica.version}}";

    private static readonly string MonicaVersion = ResolveMonicaVersion();

    public static string Expand(string markdown)
    {
        return markdown.Replace(
            MONICA_VERSION_TOKEN,
            MonicaVersion,
            StringComparison.Ordinal);
    }

    private static string ResolveMonicaVersion()
    {
        var informationalVersion = typeof(MonicaApplication).Assembly
            .GetCustomAttribute<AssemblyInformationalVersionAttribute>()?
            .InformationalVersion;
        if (string.IsNullOrWhiteSpace(informationalVersion))
        {
            throw new InvalidOperationException("Monica.Core does not expose an informational version.");
        }

        // Source Link appends commit metadata; package installation commands require the semantic package version.
        var buildMetadataIndex = informationalVersion.IndexOf('+', StringComparison.Ordinal);
        return buildMetadataIndex < 0
            ? informationalVersion
            : informationalVersion[..buildMetadataIndex];
    }
}
