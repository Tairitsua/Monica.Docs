using Domains.Documentation.Interfaces;
using Domains.Documentation.ValueObjects;
using Monica.Core.Results;
using Monica.WebApi.Abstractions;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

namespace Domains.Documentation.Application.HandlersQuery;

/// <summary>
/// Returns the navigation tree for the configured Monica documentation source.
/// </summary>
public sealed class QueryHandlerGetDocTree(
    IRepositoryDocumentationContent repository)
    : ApplicationService<QueryGetDocTree, IReadOnlyList<DocTreeItemDto>>
{
    public override async Task<Res<IReadOnlyList<DocTreeItemDto>>> Handle(
        QueryGetDocTree request,
        CancellationToken cancellationToken)
    {
        var nodes = await repository.GetTreeAsync(request.Locale, cancellationToken);
        if (nodes is null)
        {
            return Res.Fail($"Documentation locale '{request.Locale}' is not supported.");
        }

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
