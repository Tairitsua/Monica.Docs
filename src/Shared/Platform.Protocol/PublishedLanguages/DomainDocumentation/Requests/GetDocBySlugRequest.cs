using Monica.WebApi.Abstractions;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;

namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

/// <summary>
/// Requests the processed Markdown document identified by a documentation slug.
/// </summary>
/// <param name="Slug">The normalized documentation slug to load.</param>
/// <param name="Locale">The requested BCP 47 culture name.</param>
public sealed record GetDocBySlugRequest(string Slug, string Locale = "en-US")
    : IResultRequest<DocContentDto>;
