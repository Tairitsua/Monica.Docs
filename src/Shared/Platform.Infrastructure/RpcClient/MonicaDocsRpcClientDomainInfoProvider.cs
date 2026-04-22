using Monica.Modules;
using Platform.Protocol.RpcClient;

namespace Platform.Infrastructure.RpcClient;

/// <summary>
/// Supplies the dependent RPC domain set used by the Monica.Docs local RPC sample.
/// </summary>
public sealed class MonicaDocsRpcClientDomainInfoProvider : IRpcClientDomainInfoProvider
{
    /// <inheritdoc />
    public object GetDependencyDomains()
    {
        return MonicaDocsRpcDomain.LocalRpcProvider;
    }

    /// <inheritdoc />
    public string GetDomainRelatedAppId(Enum domain)
    {
        return domain.ToString();
    }
}
