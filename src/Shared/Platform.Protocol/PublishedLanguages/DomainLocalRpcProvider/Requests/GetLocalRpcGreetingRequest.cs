using Monica.WebApi.Abstractions;
using Platform.Protocol.PublishedLanguages.DomainLocalRpcProvider.Models;

namespace Platform.Protocol.PublishedLanguages.DomainLocalRpcProvider.Requests;

/// <summary>
/// Requests a greeting payload from the local RPC provider sample domain.
/// </summary>
public sealed record GetLocalRpcGreetingRequest(string ConsumerName)
    : IResultRequest<LocalRpcGreetingDto>;
