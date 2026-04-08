using Microsoft.Extensions.DependencyInjection;
using Monica.Core.Mediator;
using Monica.Core.Results;
using Monica.Docs.Domains.Documentation.Application.HandlersQuery;
using Monica.Docs.Domains.Documentation.Domain.Interfaces;
using Monica.Docs.Domains.Documentation.Infrastructure.Configurations;
using Monica.Docs.Domains.Documentation.Infrastructure.Providers;
using Monica.Docs.Domains.Documentation.Infrastructure.Repository;
using Monica.Docs.Shared.Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;
using Monica.Docs.Shared.Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

namespace Monica.Docs.Domains.Documentation.Infrastructure.DependencyInjection;

public static class DocumentationDependencyInjection
{
    public static IServiceCollection AddDocumentationInfrastructure(
        this IServiceCollection services,
        Action<DocumentationApiOptions>? configure = null)
    {
        services.AddOptions<DocumentationApiOptions>()
            .BindConfiguration(DocumentationApiOptions.SectionName);

        if (configure is not null)
        {
            services.PostConfigure(configure);
        }

        services.AddSingleton<IRepositoryDocumentationContent, RepositoryDocumentationContent>();
        services.AddSingleton<IDocumentationMarkdownProcessor, DocumentationMarkdownProcessor>();
        services.AddTransient<
            IRequestHandler<GetDocTreeRequest, Res<IReadOnlyList<DocTreeItemDto>>>,
            QueryHandlerGetDocTree>();
        services.AddTransient<IRequestHandler<GetDocBySlugRequest, Res<DocContentDto>>, QueryHandlerGetDocBySlug>();
        services.AddTransient<IRequestHandler<GetDocAssetRequest, object>, QueryHandlerGetDocAsset>();

        return services;
    }
}
