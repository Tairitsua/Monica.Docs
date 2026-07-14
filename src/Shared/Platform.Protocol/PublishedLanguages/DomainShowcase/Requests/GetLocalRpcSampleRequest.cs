using Monica.WebApi.Abstractions;
using Platform.Protocol.PublishedLanguages.DomainShowcase.Models;

namespace Platform.Protocol.PublishedLanguages.DomainShowcase.Requests;

/// <summary>
/// Requests the showcase domain to call the local RPC provider domain.
/// </summary>
public sealed record GetLocalRpcSampleRequest(string ConsumerName = "Documentation")
    : IResultRequest<LocalRpcSampleDto>;
