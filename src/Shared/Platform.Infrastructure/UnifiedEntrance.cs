using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Monica.Core;
using Monica.Core.Modularity.Extensions;
using Monica.Docs.Domains.Documentation.Application.HandlersQuery;
using Monica.Docs.Domains.Documentation.Domain.Interfaces;
using Monica.Docs.Domains.Documentation.Infrastructure.Configurations;
using Monica.Docs.Domains.Documentation.Infrastructure.DependencyInjection;
using Monica.Framework.ProjectUnits.Models;
using Monica.Docs.Shared.Platform.Infrastructure.Controllers;
using Monica.Modules;

namespace Monica.Docs.Shared.Platform.Infrastructure;

public static class UnifiedEntrance
{
    private static readonly string[] SwaggerAssemblies =
    [
        "Monica.Docs.AppHost.Api",
        "Monica.Docs.Shared.Platform.Protocol",
        "Monica.Docs.Shared.Platform.Infrastructure",
        "Monica.Docs.Domains.Documentation.Application",
        "Monica.Docs.Domains.Documentation.Domain",
        "Monica.Docs.Domains.Documentation.Infrastructure"
    ];

    public static void UnifiedConfigureBuilder(this WebApplicationBuilder builder)
    {
        ForceLoadDocumentationAssemblies();
        builder.Services.AddDocumentationInfrastructure();

        Mo.AddResultEnvelope().UseResultFieldNames(o => o.Status = "code");
        Mo.AddEventBus().UseNoOpDistributedEventBus();
        Mo.AddObjectMapping();
        Mo.AddJsonSerialization();
        Mo.AddControllers().ConfigMvcBuilder((mvcBuilder, _) =>
        {
            mvcBuilder.AddApplicationPart(typeof(DocumentationController).Assembly)
                .AddControllersAsServices();
        }).ConfigDependentServices(services =>
        {
            services.AddEndpointsApiExplorer();
        });
        Mo.AddDependencyInjection();
        Mo.AddMediator();
        Mo.AddExceptionHandling();
        Mo.AddSwagger(o =>
        {
            o.AppName = "Monica.Docs API";
            o.Version = "v1";
            o.DocumentAssemblies = SwaggerAssemblies;
        });
        Mo.AddProjectUnits(o =>
        {
            o.ConventionOptions.EnableNameConvention = true;
            o.ConventionOptions.NameConventionMode = ENameConventionMode.Strict;
        });
        Mo.AddMarkdown(o =>
            {
                o.ParseFrontMatter = true;
            })
            .AddDocumentGroup(
                key: DocumentationApiOptions.DefaultDocumentGroupKey,
                title: "Monica Docs",
                basePath: ResolveDocsBasePath(builder.Environment));
    }

    public static void UnifiedConfigureApplication(this WebApplication app)
    {
        app.UseMonica();
        app.MapControllers();
        app.MapMonica();
    }

    private static string ResolveDocsBasePath(IHostEnvironment environment)
    {
        var localDocsPath = Path.Combine(environment.ContentRootPath, "docs");
        if (Directory.Exists(localDocsPath))
        {
            return localDocsPath;
        }

        return Path.GetFullPath(Path.Combine(environment.ContentRootPath, "..", "..", "..", "docs"));
    }

    private static void ForceLoadDocumentationAssemblies()
    {
        _ = typeof(QueryHandlerGetDocTree).Assembly;
        _ = typeof(IRepositoryDocumentationContent).Assembly;
        _ = typeof(DocumentationDependencyInjection).Assembly;
    }
}
