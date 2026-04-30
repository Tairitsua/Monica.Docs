using Monica.Core.Mediator;

namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

/// <summary>
/// Requests a static documentation asset by its normalized relative path.
/// </summary>
/// <param name="AssetPath">The relative asset path under the configured documentation source.</param>
public sealed record GetDocAssetRequest(string AssetPath) : IRequest<object>;
