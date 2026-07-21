using Monica.WebApi.Abstractions;
using Monica.WebApi.Annotations;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;

namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

/// <summary>
/// Returns the locales currently available in the public documentation catalog.
/// </summary>
[ApiEndpoint(ApiHttpMethod.Get, "locales", Binding = ApiRequestBinding.Query)]
public sealed record QueryGetDocLocales
    : IResultRequest<IReadOnlyList<DocLocaleDto>>;
