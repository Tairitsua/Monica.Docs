using Monica.Core.Results;
using Monica.Docs.Domains.Documentation.Entities;
using Monica.Docs.Domains.Documentation.Interfaces;
using Monica.Docs.Domains.Documentation.DomainServices;
using Monica.Docs.Domains.Documentation.ValueObjects;
using Monica.Docs.Shared.Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;
using Monica.Docs.Shared.Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;
using Monica.WebApi.Abstractions;

namespace Monica.Docs.Domains.Documentation.Application.HandlersQuery;

public sealed class QueryHandlerGetDocBySlug(
    IRepositoryDocumentationContent repository,
    IDocumentationMarkdownProcessor markdownProcessor)
    : ApplicationService<GetDocBySlugRequest, DocContentDto>
{
    public override async Task<Res<DocContentDto>> Handle(
        GetDocBySlugRequest request,
        CancellationToken cancellationToken)
    {
        var normalizedSlug = DomainDocumentationPathRules.NormalizeSlug(request.Slug);
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
        var segments = DomainDocumentationPathRules.NormalizeRelativePath(document.RelativePath)
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
