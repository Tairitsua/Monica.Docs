using Microsoft.Extensions.DependencyInjection;
using Monica.Core.Mediator;
using Monica.Core.Results;
using Monica.Docs.Domains.Documentation.Application.HandlersQuery;
using Monica.Docs.Domains.Documentation.Configurations;
using Monica.Docs.Domains.Documentation.Interfaces;
using Monica.Docs.Domains.Documentation.Providers;
using Monica.Docs.Domains.Documentation.Repository;
using Monica.Docs.Shared.Platform.Protocol.PublishedLanguages.DomainDocumentation.Models;
using Monica.Docs.Shared.Platform.Protocol.PublishedLanguages.DomainDocumentation.Requests;

namespace Monica.Docs.Domains.Documentation;

public static class DocumentationDomainRegistration
{
    public static IServiceCollection AddDocumentationDomain(
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
     
        return services;
    }
}
