using Domains.Documentation.DomainServices;
using Domains.Documentation.Interfaces;
using Domains.Documentation.Utilities;
using Microsoft.AspNetCore.Mvc;
using Monica.Core.Results;
using Monica.WebApi.Abstractions;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

namespace Domains.Documentation.Application.HandlersQuery;

/// <summary>
/// Serves binary assets that belong to the configured Monica documentation source.
/// </summary>
public sealed class QueryHandlerGetDocAsset(
    IRepositoryDocumentationContent repository)
    : CustomApplicationService<GetDocAssetRequest, object>
{
    /// <summary>
    /// Resolves an asset path and returns a ranged physical-file response when the asset exists.
    /// </summary>
    [HttpGet("assets")]
    public override async Task<object> Handle(
        GetDocAssetRequest request,
        CancellationToken cancellationToken)
    {
        var normalizedAssetPath = UtilsDocumentationPath.NormalizeRelativePath(request.AssetPath);
        if (string.IsNullOrWhiteSpace(normalizedAssetPath))
        {
            return Res.Fail("Documentation asset path is required.");
        }

        var asset = await repository.GetAssetAsync(normalizedAssetPath, cancellationToken);
        if (asset is null)
        {
            return Res.Fail($"Documentation asset '{normalizedAssetPath}' was not found.");
        }

        return new PhysicalFileResult(asset.FilePath, asset.ContentType)
        {
            EnableRangeProcessing = true
        };
    }
}
