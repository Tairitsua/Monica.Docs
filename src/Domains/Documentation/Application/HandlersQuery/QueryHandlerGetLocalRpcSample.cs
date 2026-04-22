using Microsoft.AspNetCore.Mvc;
using Monica.Core.Results;
using Monica.WebApi.Abstractions;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;
using Platform.Protocol.PublishedLanguages.DomainLocalRpcProvider.Contracts;
using Platform.Protocol.PublishedLanguages.DomainLocalRpcProvider.Requests;

namespace Domains.Documentation.Application.HandlersQuery;

/// <summary>
/// Demonstrates calling another domain through the generated local RPC client inside the same process.
/// </summary>
public sealed class QueryHandlerGetLocalRpcSample(
    IQueryLocalRpcProvider localRpcProvider)
    : ApplicationService<GetLocalRpcSampleRequest, LocalRpcSampleDto>
{
    /// <summary>
    /// Calls the local RPC provider domain and returns the combined sample payload.
    /// </summary>
    [HttpGet("local-rpc-sample")]
    public override async Task<Res<LocalRpcSampleDto>> Handle(
        GetLocalRpcSampleRequest request,
        CancellationToken cancellationToken)
    {
        var providerResult = await localRpcProvider.GetLocalRpcGreeting(
            new GetLocalRpcGreetingRequest(request.ConsumerName));

        if (providerResult.IsFailed(out var error, out var providerGreeting))
        {
            return error!;
        }

        return new LocalRpcSampleDto(
            request.ConsumerName,
            providerGreeting.Message,
            providerGreeting.GeneratedAtUtc,
            "Local");
    }
}
