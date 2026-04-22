namespace Platform.Protocol.PublishedLanguages.DomainLocalRpcProvider.Models;

/// <summary>
/// Describes the message returned by the local RPC provider sample domain.
/// </summary>
public sealed record LocalRpcGreetingDto(
    string Message,
    DateTimeOffset GeneratedAtUtc);
