using Microsoft.AspNetCore.Mvc;
using Monica.Core.Results;
using Monica.WebApi.Abstractions;
using Platform.Protocol.PublishedLanguages.DomainLocalRpcProvider.Models;
using Platform.Protocol.PublishedLanguages.DomainLocalRpcProvider.Requests;

namespace Domains.LocalRpcProvider.Application.HandlersQuery;

/// <summary>
/// Provides a simple payload used to verify local RPC dispatch inside the Monica.Docs modular-monolith sample.
/// </summary>
public sealed class QueryHandlerGetLocalRpcGreeting
    : ApplicationService<GetLocalRpcGreetingRequest, LocalRpcGreetingDto>
{
    /// <summary>
    /// Returns a simple greeting payload for the caller domain.
    /// </summary>
    [HttpGet("greeting")]
    public override Task<Res<LocalRpcGreetingDto>> Handle(
        GetLocalRpcGreetingRequest request,
        CancellationToken cancellationToken)
    {
        return Task.FromResult<Res<LocalRpcGreetingDto>>(new LocalRpcGreetingDto(
            $"Hello {request.ConsumerName} from LocalRpcProvider.",
            DateTimeOffset.UtcNow));
    }
}
