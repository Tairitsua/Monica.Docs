using Domains.Documentation.DomainServices;
using Domains.Documentation.Entities;
using Domains.Documentation.Interfaces;
using Domains.Documentation.Utils;
using Domains.Documentation.ValueObjects;
using Microsoft.AspNetCore.Mvc;
using Monica.Core.Results;
using Monica.WebApi.Abstractions;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

namespace Domains.Documentation.Application.HandlersQuery;

public sealed class QueryHandlerGetDocBySlug(
    IRepositoryDocumentationContent repository,
    DomainDocumentationMarkdownProcessor markdownProcessor)
    : ApplicationService<GetDocBySlugRequest, DocContentDto>
{
    [HttpGet("doc")]
    public override async Task<Res<DocContentDto>> Handle(
        GetDocBySlugRequest request,
        CancellationToken cancellationToken)
    {
        var normalizedSlug = DocumentationPathUtils.NormalizeSlug(request.Slug);
        if (string.IsNullOrWhiteSpace(normalizedSlug))
        {
            return Res.Fail("Document slug is required.");
        }

        var document = await repository.GetDocumentBySlugAsync(normalizedSlug, cancellationToken);
        if (document is null)
        {
            return Res.Fail($"Documentation '{normalizedSlug}' was not found.");
        }

        var processedDocument = markdownProcessor.Process(document);
        var displayTitle = ResolveDisplayTitle(document, processedDocument);
        return Res.Ok(new DocContentDto(
            document.Slug,
            displayTitle,
            document.RelativePath,
            processedDocument.Markdown,
            document.LastModifiedUtc,
            document.Date,
            document.Tags,
            document.Metadata,
            processedDocument.Headings
                .Select(static heading => new DocHeadingDto(
                    heading.Id,
                    heading.Title,
                    heading.Level))
                .ToList(),
            BuildBreadcrumbs(document, displayTitle)));
    }

    private static IReadOnlyList<DocBreadcrumbDto> BuildBreadcrumbs(
        DocumentationSourceDocument document,
        string displayTitle)
    {
        var segments = DocumentationPathUtils.NormalizeRelativePath(document.RelativePath)
            .Split('/', StringSplitOptions.RemoveEmptyEntries);

        if (segments.Length <= 1)
        {
            return [new DocBreadcrumbDto(displayTitle, document.Slug, true)];
        }

        var breadcrumbs = new List<DocBreadcrumbDto>(segments.Length);
        for (var index = 0; index < segments.Length - 1; index++)
        {
            breadcrumbs.Add(new DocBreadcrumbDto(segments[index], null, false));
        }

        breadcrumbs.Add(new DocBreadcrumbDto(displayTitle, document.Slug, true));
        return breadcrumbs;
    }

    private static string ResolveDisplayTitle(
        DocumentationSourceDocument document,
        DocumentationProcessedDocument processedDocument)
    {
        return processedDocument.Headings
            .FirstOrDefault(static heading => heading.Level == 1)
            ?.Title
            ?? document.Title;
    }
}
