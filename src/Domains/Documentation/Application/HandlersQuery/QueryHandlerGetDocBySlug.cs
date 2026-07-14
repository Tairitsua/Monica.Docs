using Domains.Documentation.Configurations;
using Domains.Documentation.DomainServices;
using Domains.Documentation.Entities;
using Domains.Documentation.Interfaces;
using Domains.Documentation.Utilities;
using Domains.Documentation.ValueObjects;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Monica.Core.Results;
using Monica.WebApi.Abstractions;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

namespace Domains.Documentation.Application.HandlersQuery;

/// <summary>
/// Returns a processed Markdown document for a normalized documentation slug.
/// </summary>
public sealed class QueryHandlerGetDocBySlug(
    IRepositoryDocumentationContent repository,
    DomainDocumentationMarkdownProcessor markdownProcessor,
    IOptions<DocumentationApiOptions> options,
    ILoggerFactory loggerFactory)
    : ApplicationService<GetDocBySlugRequest, DocContentDto>(loggerFactory)
{
    private readonly DocumentationApiOptions _options = options.Value;

    /// <summary>
    /// Resolves the requested document, rewrites local assets, extracts headings, and builds breadcrumbs.
    /// </summary>
    [HttpGet("doc")]
    public override async Task<Res<DocContentDto>> Handle(
        GetDocBySlugRequest request,
        CancellationToken cancellationToken)
    {
        var normalizedSlug = UtilsDocumentationPath.NormalizeSlug(request.Slug);
        if (string.IsNullOrWhiteSpace(normalizedSlug))
        {
            return Res.Fail("Document slug is required.");
        }

        var page = await repository.GetDocumentPageAsync(
            request.Locale,
            normalizedSlug,
            cancellationToken);
        if (page is null && !normalizedSlug.EndsWith("/index", StringComparison.OrdinalIgnoreCase))
        {
            page = await repository.GetDocumentPageAsync(
                request.Locale,
                $"{normalizedSlug}/index",
                cancellationToken);
        }

        if (page is null)
        {
            return Res.Fail(
                $"Documentation '{normalizedSlug}' was not found for locale '{request.Locale}'.",
                ResStatus.NotFound);
        }

        var document = page.Document;
        var processedDocument = markdownProcessor.Process(document);
        var displayTitle = ResolveDisplayTitle(document, processedDocument);
        return Res.Ok(new DocContentDto(
            document.Locale,
            document.Slug,
            displayTitle,
            document.RelativePath,
            BuildPublicPath(document.Locale, document.Slug),
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
            BuildBreadcrumbs(document, displayTitle),
            page.Alternates
                .Select(alternate => new DocAlternateDto(
                    alternate.Locale,
                    alternate.Slug,
                    alternate.Title,
                    BuildPublicPath(alternate.Locale, alternate.Slug)))
                .ToList(),
            MapNavigationLink(page.Previous),
            MapNavigationLink(page.Next)));
    }

    private static IReadOnlyList<DocBreadcrumbDto> BuildBreadcrumbs(
        DocumentationSourceDocument document,
        string displayTitle)
    {
        var segments = UtilsDocumentationPath.NormalizeRelativePath(document.NavigationRelativePath)
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

    private DocNavigationLinkDto? MapNavigationLink(
        DocumentationNavigationDocument? document)
    {
        return document is null
            ? null
            : new DocNavigationLinkDto(
                document.Slug,
                document.Title,
                BuildPublicPath(document.Locale, document.Slug));
    }

    private string BuildPublicPath(string locale, string slug)
    {
        return UtilsDocumentationPath.BuildPublicDocumentPath(
            locale,
            slug,
            _options.DefaultCulture);
    }
}
