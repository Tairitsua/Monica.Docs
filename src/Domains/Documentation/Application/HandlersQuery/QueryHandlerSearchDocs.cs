using Domains.Documentation.Configurations;
using Domains.Documentation.Interfaces;
using Domains.Documentation.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Monica.Core.Results;
using Monica.Markdown.Abstractions;
using Monica.Markdown.Models;
using Monica.WebApi.Abstractions;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

namespace Domains.Documentation.Application.HandlersQuery;

/// <summary>
/// Searches the public Markdown catalog within one requested locale.
/// </summary>
public sealed class QueryHandlerSearchDocs(
    IRepositoryDocumentationContent repository,
    IMarkdownDocumentSearcher searcher,
    IOptions<DocumentationApiOptions> options,
    ILoggerFactory loggerFactory)
    : ApplicationService<SearchDocsRequest, IReadOnlyList<DocSearchResultDto>>(loggerFactory)
{
    private const int MAX_QUERY_LENGTH = 160;
    private readonly DocumentationApiOptions _options = options.Value;

    /// <summary>
    /// Returns ranked document results with preview highlights and stable website paths.
    /// </summary>
    [HttpGet("search")]
    public override async Task<Res<IReadOnlyList<DocSearchResultDto>>> Handle(
        SearchDocsRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Query))
        {
            return Res.Fail("A documentation search query is required.");
        }

        var query = request.Query.Trim();
        if (query.Length > MAX_QUERY_LENGTH)
        {
            return Res.Fail($"Documentation search queries cannot exceed {MAX_QUERY_LENGTH} characters.");
        }

        var locales = await repository.GetLocalesAsync(cancellationToken);
        var locale = locales.FirstOrDefault(candidate =>
            string.Equals(candidate.Culture, request.Locale, StringComparison.OrdinalIgnoreCase));
        if (locale is null)
        {
            return Res.Fail($"Documentation locale '{request.Locale}' is not supported.");
        }

        var results = await searcher.SearchAsync(
            new MarkdownDocumentSearchRequest(
                query,
                _options.DocumentGroupKey,
                IncludeAllKnowledgeBases: false,
                locale.Culture),
            cancellationToken);

        var response = results
            .Select(result => MapResult(locale.Culture, result))
            .ToList();

        return Res.Ok<IReadOnlyList<DocSearchResultDto>>(response);
    }

    private DocSearchResultDto MapResult(
        string locale,
        MarkdownDocumentSearchResult result)
    {
        var slug = UtilsDocumentationPath.ToSlug(result.DocumentRelativePath);
        return new DocSearchResultDto(
            locale,
            slug,
            result.DocumentTitle,
            UtilsDocumentationPath.BuildPublicDocumentPath(
                locale,
                slug,
                _options.DefaultCulture),
            result.DocumentPathTrail,
            result.SectionTitle,
            result.PreviewText,
            result.PreviewHighlights
                .Select(static segment => new DocSearchMatchDto(segment.Start, segment.Length))
                .ToList(),
            result.AnchorId,
            result.Score);
    }
}
