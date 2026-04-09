using Microsoft.AspNetCore.Mvc;
using Monica.Core.Results;
using Monica.Docs.Domains.Documentation.Interfaces;
using Monica.Docs.Domains.Documentation.DomainServices;
using Monica.Docs.Shared.Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;
using Monica.WebApi.Abstractions;

namespace Monica.Docs.Domains.Documentation.Application.HandlersQuery;

public sealed class QueryHandlerGetDocAsset(
    IRepositoryDocumentationContent repository)
    : CustomApplicationService<GetDocAssetRequest, object>
{
    public override async Task<object> Handle(
        GetDocAssetRequest request,
        CancellationToken cancellationToken)
    {
        var normalizedAssetPath = DomainDocumentationPathRules.NormalizeRelativePath(request.AssetPath);
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
