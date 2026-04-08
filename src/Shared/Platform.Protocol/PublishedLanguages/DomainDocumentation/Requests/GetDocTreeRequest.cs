using Monica.Docs.Shared.Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;
using Monica.WebApi.Abstractions;

namespace Monica.Docs.Shared.Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

public sealed record GetDocTreeRequest
    : IResultRequest<IReadOnlyList<DocTreeItemDto>>;
