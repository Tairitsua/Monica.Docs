using Monica.Core.Mediator;

namespace Monica.Docs.Shared.Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

public sealed record GetDocAssetRequest(string AssetPath) : IRequest<object>;
