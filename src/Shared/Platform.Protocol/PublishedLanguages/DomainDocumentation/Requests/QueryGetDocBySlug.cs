using Monica.WebApi.Abstractions;
using Monica.WebApi.Annotations;
using Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;

namespace Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

/// <summary>
/// Returns the processed Markdown document identified by a documentation slug.
/// </summary>
/// <param name="Slug">The normalized documentation slug to load.</param>
/// <param name="Locale">The requested BCP 47 culture name.</param>
[ApiEndpoint(ApiHttpMethod.Get, "doc", Binding = ApiRequestBinding.Query)]
public sealed record QueryGetDocBySlug(string Slug, string Locale = "en-US")
    : IResultRequest<DocContentDto>;
