using Monica.Core;
using Monica.Core.Modularity.Extensions;
using Monica.Docs.Domains.Documentation;
using Monica.Docs.Domains.Documentation.Configurations;
using Monica.Docs.Shared.Platform.Infrastructure.Controllers;
using Monica.Framework.ProjectUnits.Models;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDocumentationDomain();

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
    o.DocumentAssemblies =
    [
        "Monica.Docs.Api",
        "Monica.Docs.Shared.Platform.Protocol",
        "Monica.Docs.Shared.Platform.Infrastructure",
        "Monica.Docs.Domains.Documentation"
    ];
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

builder.UseMonica();

var app = builder.Build();

app.UseMonica();
app.MapControllers();
app.MapMonica();
app.Run();

return;

static string ResolveDocsBasePath(IHostEnvironment environment)
{
    var localDocsPath = Path.Combine(environment.ContentRootPath, "docs");
    if (Directory.Exists(localDocsPath))
    {
        return localDocsPath;
    }

    return Path.GetFullPath(Path.Combine(environment.ContentRootPath, "..", "..", "..", "docs"));
}

public partial class Program;
