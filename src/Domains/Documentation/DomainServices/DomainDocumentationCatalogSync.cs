using Domains.Documentation.Configurations;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Monica.Markdown.Abstractions;
using Monica.WebApi.Abstractions;

namespace Domains.Documentation.DomainServices;

/// <summary>
/// Coordinates markdown document catalog refreshes for the configured Monica.Docs document group.
/// </summary>
public sealed class DomainDocumentationCatalogSync(
    IMarkdownDocumentCatalog markdownCatalog,
    IOptions<DocumentationApiOptions> options,
    ILogger<DomainDocumentationCatalogSync> logger)
    : DomainService
{
    private readonly DocumentationApiOptions _options = options.Value;

    /// <summary>
    /// Refreshes the configured markdown document group.
    /// </summary>
    public async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation(
            "Refreshing markdown document group {DocumentGroupKey} for Monica.Docs.",
            _options.DocumentGroupKey);

        await markdownCatalog.RefreshAsync(_options.DocumentGroupKey);
    }
}
