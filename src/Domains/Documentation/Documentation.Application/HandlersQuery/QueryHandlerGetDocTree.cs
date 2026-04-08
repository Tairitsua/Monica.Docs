using Monica.Core.Results;
using Monica.Docs.Domains.Documentation.Domain.Interfaces;
using Monica.Docs.Domains.Documentation.Domain.Models;
using Monica.Docs.Shared.Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;
using Monica.Docs.Shared.Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;
using Monica.WebApi.Abstractions;

namespace Monica.Docs.Domains.Documentation.Application.HandlersQuery;

public sealed class QueryHandlerGetDocTree(
    IRepositoryDocumentationContent repository)
    : ApplicationService<GetDocTreeRequest, IReadOnlyList<DocTreeItemDto>>
{
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
