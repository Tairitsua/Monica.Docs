using Monica.WebApi.Abstractions;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;

namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

public sealed record GetDocTreeRequest
    : IResultRequest<IReadOnlyList<DocTreeItemDto>>;
