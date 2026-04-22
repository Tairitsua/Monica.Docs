using System.ComponentModel;

namespace Platform.Protocol.RpcClient;

/// <summary>
/// Declares the RPC domains available in the Monica.Docs modular-monolith sample.
/// </summary>
[Flags]
public enum MonicaDocsRpcDomain
{
    /// <summary>
    /// No dependent RPC domains.
    /// </summary>
    None = 0,

    /// <summary>
    /// The documentation domain.
    /// </summary>
    [Description("Documentation")]
    Documentation = 1 << 0,

    /// <summary>
    /// The local RPC provider sample domain.
    /// </summary>
    [Description("Local Rpc Provider")]
    LocalRpcProvider = 1 << 1
}
