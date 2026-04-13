using Domains.Documentation.Interfaces;
using Domains.Documentation.ValueObjects;
using Microsoft.AspNetCore.Mvc;
using Monica.Core.Results;
using Monica.WebApi.Abstractions;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

namespace Domains.Documentation.Application.HandlersQuery;

[Route("api/docs/tree")]
public sealed class QueryHandlerGetDocTree(
    IRepositoryDocumentationContent repository)
    : ApplicationService<GetDocTreeRequest, IReadOnlyList<DocTreeItemDto>>
{
    [HttpGet]
    public override async Task<Res<IReadOnlyList<DocTreeItemDto>>> Handle(
        GetDocTreeRequest request,
        CancellationToken cancellationToken)
    {
        var nodes = await repository.GetTreeAsync(cancellationToken);
        var response = nodes.Select(MapNode).ToList();
        return Res.Ok<IReadOnlyList<DocTreeItemDto>>(response);
    }

    private static DocTreeItemDto MapNode(DocumentationTreeNode node)
    {
        return new DocTreeItemDto(
            node.Title,
            node.RelativePath,
            node.Slug,
            node.IsDocument,
            node.Children.Select(MapNode).ToList());
    }
}
