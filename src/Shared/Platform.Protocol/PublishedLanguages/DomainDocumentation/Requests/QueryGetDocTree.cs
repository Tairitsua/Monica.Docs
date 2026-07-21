using Monica.WebApi.Abstractions;
using Monica.WebApi.Annotations;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;

namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

/// <summary>
/// Returns the locale-relative documentation navigation tree.
/// </summary>
/// <param name="Locale">The requested BCP 47 culture name.</param>
[ApiEndpoint(ApiHttpMethod.Get, "tree", Binding = ApiRequestBinding.Query)]
public sealed record QueryGetDocTree(string Locale = "en-US")
    : IResultRequest<IReadOnlyList<DocTreeItemDto>>;
