using Monica.WebApi.Abstractions;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;

namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

/// <summary>
/// Requests the documentation navigation tree for the configured document group.
/// </summary>
public sealed record GetDocTreeRequest
    : IResultRequest<IReadOnlyList<DocTreeItemDto>>;
