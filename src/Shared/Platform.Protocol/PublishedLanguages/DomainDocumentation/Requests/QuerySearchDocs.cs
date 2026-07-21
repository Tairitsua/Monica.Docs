using Monica.WebApi.Abstractions;
using Monica.WebApi.Annotations;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;

namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

/// <summary>
/// Returns locale-scoped full-text documentation search results.
/// </summary>
/// <param name="Query">The query text. Queries shorter than the configured minimum return no results.</param>
/// <param name="Locale">The requested BCP 47 culture name.</param>
[ApiEndpoint(ApiHttpMethod.Get, "search", Binding = ApiRequestBinding.Query)]
public sealed record QuerySearchDocs(string Query, string Locale = "en-US")
    : IResultRequest<IReadOnlyList<DocSearchResultDto>>;
