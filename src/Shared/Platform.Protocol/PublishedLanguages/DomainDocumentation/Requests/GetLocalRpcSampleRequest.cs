using Monica.WebApi.Abstractions;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;

namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

/// <summary>
/// Requests the documentation domain to call the local RPC provider sample domain.
/// </summary>
public sealed record GetLocalRpcSampleRequest(string ConsumerName = "Documentation")
    : IResultRequest<LocalRpcSampleDto>;
