using Monica.WebApi.Abstractions;
using Monica.WebApi.Annotations;
using Platform.Protocol.PublishedLanguages.DomainLocalRpcProvider.Models;

namespace Platform.Protocol.PublishedLanguages.DomainLocalRpcProvider.Requests;

/// <summary>
/// Returns a greeting payload from the local RPC provider sample domain.
/// </summary>
/// <param name="ConsumerName">The display name included in the generated greeting.</param>
[ApiEndpoint(ApiHttpMethod.Get, "greeting", Binding = ApiRequestBinding.Query)]
public sealed record QueryGetLocalRpcGreeting(string ConsumerName)
    : IResultRequest<LocalRpcGreetingDto>;
