using Domains.Documentation.Interfaces;
using Domains.Documentation.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using Monica.Core.Mediator;
using Monica.Core.Results;
using Monica.WebApi.Abstractions;
using Monica.WebApi.Annotations;

namespace Domains.Documentation.Application.HandlersQuery;

/// <summary>
/// Returns a binary asset from the configured Monica documentation source.
/// </summary>
/// <param name="AssetPath">The relative asset path under the configured documentation source.</param>
[ApiEndpoint(ApiHttpMethod.Get, "assets", Binding = ApiRequestBinding.Query)]
public sealed record QueryGetDocAsset(string AssetPath) : IRequest<object>;

/// <summary>
/// Serves binary assets that belong to the configured Monica documentation source.
/// </summary>
public sealed class QueryHandlerGetDocAsset(
    IRepositoryDocumentationContent repository)
    : CustomApplicationService<QueryGetDocAsset, object>
{
    public override async Task<object> Handle(
        QueryGetDocAsset request,
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
            return Res.Fail(
                $"Documentation asset '{normalizedAssetPath}' was not found.",
                ResStatus.NotFound);
        }

        return new PhysicalFileResult(asset.FilePath, asset.ContentType)
        {
            EnableRangeProcessing = true,
            EntityTag = new EntityTagHeaderValue(
                $"\"{asset.LastModifiedUtc.Ticks:x}-{asset.Length:x}\""),
            LastModified = new DateTimeOffset(asset.LastModifiedUtc.ToUniversalTime())
        };
    }
}
