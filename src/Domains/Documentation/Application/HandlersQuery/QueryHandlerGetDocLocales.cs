using Domains.Documentation.Configurations;
using Domains.Documentation.Interfaces;
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
    IOptions<DocumentationApiOptions> options)
    : ApplicationService<QueryGetDocLocales, IReadOnlyList<DocLocaleDto>>
{
    private readonly DocumentationApiOptions _options = options.Value;

    public override async Task<Res<IReadOnlyList<DocLocaleDto>>> Handle(
        QueryGetDocLocales request,
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
