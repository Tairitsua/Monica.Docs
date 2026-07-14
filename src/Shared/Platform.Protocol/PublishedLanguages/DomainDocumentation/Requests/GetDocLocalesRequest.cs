using Monica.WebApi.Abstractions;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;

namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

/// <summary>
/// Requests the locales currently available in the public documentation catalog.
/// </summary>
public sealed record GetDocLocalesRequest
    : IResultRequest<IReadOnlyList<DocLocaleDto>>;
