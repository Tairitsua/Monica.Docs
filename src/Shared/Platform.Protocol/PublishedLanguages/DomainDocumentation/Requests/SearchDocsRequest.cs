using Monica.WebApi.Abstractions;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;

namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

/// <summary>
/// Requests locale-scoped full-text documentation search results.
/// </summary>
/// <param name="Query">The query text. Queries shorter than the configured minimum return no results.</param>
/// <param name="Locale">The requested BCP 47 culture name.</param>
public sealed record SearchDocsRequest(string Query, string Locale = "en-US")
    : IResultRequest<IReadOnlyList<DocSearchResultDto>>;
