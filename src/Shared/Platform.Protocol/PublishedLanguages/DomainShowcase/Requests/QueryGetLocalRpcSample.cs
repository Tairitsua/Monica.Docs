using Monica.WebApi.Abstractions;
using Monica.WebApi.Annotations;
using Platform.Protocol.PublishedLanguages.DomainShowcase.Models;

namespace Platform.Protocol.PublishedLanguages.DomainShowcase.Requests;

/// <summary>
/// Returns the result of calling the local RPC provider domain from the showcase domain.
/// </summary>
/// <param name="ConsumerName">The display name forwarded to the provider domain.</param>
[ApiEndpoint(ApiHttpMethod.Get, "local-rpc-sample", Binding = ApiRequestBinding.Query)]
public sealed record QueryGetLocalRpcSample(string ConsumerName = "Documentation")
    : IResultRequest<LocalRpcSampleDto>;
