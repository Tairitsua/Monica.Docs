namespace Platform.Protocol.PublishedLanguages.DomainShowcase.Models;

/// <summary>
/// Describes the result of the cross-domain local RPC showcase.
/// </summary>
public sealed record LocalRpcSampleDto(
    string ConsumerName,
    string ProviderMessage,
    DateTimeOffset ProviderGeneratedAtUtc,
    string Transport);
