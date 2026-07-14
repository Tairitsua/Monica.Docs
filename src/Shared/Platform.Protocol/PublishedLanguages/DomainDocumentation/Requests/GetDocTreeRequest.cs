using Monica.WebApi.Abstractions;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;

namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

/// <summary>
/// Requests the locale-relative documentation navigation tree.
/// </summary>
/// <param name="Locale">The requested BCP 47 culture name.</param>
public sealed record GetDocTreeRequest(string Locale = "en-US")
    : IResultRequest<IReadOnlyList<DocTreeItemDto>>;
