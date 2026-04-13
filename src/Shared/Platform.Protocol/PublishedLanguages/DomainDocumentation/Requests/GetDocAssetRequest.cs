using Monica.Core.Mediator;

namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

public sealed record GetDocAssetRequest(string AssetPath) : IRequest<object>;
