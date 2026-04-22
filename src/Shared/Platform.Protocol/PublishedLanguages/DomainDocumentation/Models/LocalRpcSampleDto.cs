namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;

/// <summary>
/// Describes the result returned by the documentation domain after calling another domain through local RPC.
/// </summary>
public sealed record LocalRpcSampleDto(
    string ConsumerName,
    string ProviderMessage,
    DateTimeOffset ProviderGeneratedAtUtc,
    string Transport);
