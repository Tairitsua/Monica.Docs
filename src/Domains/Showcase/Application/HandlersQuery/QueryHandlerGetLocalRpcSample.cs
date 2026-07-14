using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Monica.Core.Results;
using Monica.WebApi.Abstractions;
using Platform.Protocol.PublishedLanguages.DomainLocalRpcProvider.Contracts;
using Platform.Protocol.PublishedLanguages.DomainLocalRpcProvider.Requests;
using Platform.Protocol.PublishedLanguages.DomainShowcase.Models;
using Platform.Protocol.PublishedLanguages.DomainShowcase.Requests;

namespace Domains.Showcase.Application.HandlersQuery;

/// <summary>
/// Demonstrates calling another bounded context through the generated local RPC contract.
/// </summary>
public sealed class QueryHandlerGetLocalRpcSample(
    IQueryLocalRpcProvider localRpcProvider,
    ILoggerFactory loggerFactory)
    : ApplicationService<GetLocalRpcSampleRequest, LocalRpcSampleDto>(loggerFactory)
{
    /// <summary>
    /// Calls the local RPC provider and returns the combined showcase payload.
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
