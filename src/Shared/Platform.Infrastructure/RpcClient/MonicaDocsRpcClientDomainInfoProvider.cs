using Monica.Modules;
using Monica.WebApi.RpcClient.Models;
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
    public RpcServiceDescriptor GetDomain(Enum domain)
    {
        return new RpcServiceDescriptor(domain.ToString(), domain.ToString());
    }
}
