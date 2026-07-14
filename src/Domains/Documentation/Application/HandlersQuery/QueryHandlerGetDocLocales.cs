using Domains.Documentation.Configurations;
using Domains.Documentation.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Monica.Core.Results;
using Monica.WebApi.Abstractions;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

namespace Domains.Documentation.Application.HandlersQuery;

/// <summary>
/// Returns the locales discovered in the public documentation catalog.
/// </summary>
public sealed class QueryHandlerGetDocLocales(
    IRepositoryDocumentationContent repository,
    IOptions<DocumentationApiOptions> options,
    ILoggerFactory loggerFactory)
    : ApplicationService<GetDocLocalesRequest, IReadOnlyList<DocLocaleDto>>(loggerFactory)
{
    private readonly DocumentationApiOptions _options = options.Value;

    /// <summary>
    /// Maps discovered Markdown language roots to stable public locale metadata.
    /// </summary>
    [HttpGet("locales")]
    public override async Task<Res<IReadOnlyList<DocLocaleDto>>> Handle(
        GetDocLocalesRequest request,
        CancellationToken cancellationToken)
    {
        var locales = await repository.GetLocalesAsync(cancellationToken);
        var response = locales
            .Select(locale => new DocLocaleDto(
                locale.Culture,
                locale.DisplayName,
                locale.DocumentCount,
                string.Equals(
                    locale.Culture,
                    _options.DefaultCulture,
                    StringComparison.OrdinalIgnoreCase)))
            .ToList();

        return Res.Ok<IReadOnlyList<DocLocaleDto>>(response);
    }
}
