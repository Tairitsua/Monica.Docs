using Microsoft.Extensions.DependencyInjection;
using Monica.Docs.Domains.Documentation.Configurations;
using Monica.Docs.Domains.Documentation.Interfaces;
using Monica.Docs.Domains.Documentation.Providers;
using Monica.Docs.Domains.Documentation.Repository;

namespace Monica.Docs.Domains.Documentation.DependencyInjection;

public static class DocumentationDependencyInjection
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
