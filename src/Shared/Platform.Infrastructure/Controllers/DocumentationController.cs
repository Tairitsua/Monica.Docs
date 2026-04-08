using Microsoft.AspNetCore.Mvc;
using Monica.Core.Mediator;
using Monica.Core.Results;
using Monica.Docs.Shared.Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

namespace Monica.Docs.Shared.Platform.Infrastructure.Controllers;

[ApiController]
[Route("api/docs")]
public sealed class DocumentationController(IMediator mediator) : ControllerBase
{
    [HttpGet("tree")]
    public Task<ObjectResult> GetTree(CancellationToken cancellationToken)
    {
        return mediator.Send(new GetDocTreeRequest(), cancellationToken).GetResponse(this);
    }

    [HttpGet("assets/{**assetPath}")]
    public Task<object> GetAsset([FromRoute] string assetPath, CancellationToken cancellationToken)
    {
        return mediator.Send(new GetDocAssetRequest(assetPath), cancellationToken).GetResponse(this);
    }

    [HttpGet("{**slug}")]
    public Task<ObjectResult> GetBySlug([FromRoute] string slug, CancellationToken cancellationToken)
    {
        return mediator.Send(new GetDocBySlugRequest(slug), cancellationToken).GetResponse(this);
    }
}
