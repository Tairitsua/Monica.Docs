using Domains.Documentation.Configurations;
using Domains.Documentation.Interfaces;
using Domains.Documentation.Providers;
using Domains.Documentation.Repository;
using Microsoft.Extensions.DependencyInjection;

namespace Domains.Documentation;

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
