using Monica.WebApi.Abstractions;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;

namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

/// <summary>
/// Requests the processed Markdown document identified by a documentation slug.
/// </summary>
/// <param name="Slug">The normalized documentation slug to load.</param>
public sealed record GetDocBySlugRequest(string Slug)
    : IResultRequest<DocContentDto>;
