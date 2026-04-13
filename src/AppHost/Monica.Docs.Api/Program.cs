using Domains.Documentation;
using Domains.Documentation.Configurations;
using Monica.Core;
using Monica.Core.Modularity.Extensions;
using Monica.Docs.Domains.Documentation;
using Monica.Modules;
using Platform.Infrastructure.Controllers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDocumentationDomain();

Mo.AddResultEnvelope().UseResultFieldNames(o => o.Status = "code");
Mo.AddEventBus().UseNoOpDistributedEventBus();
Mo.AddControllers().ConfigMvcBuilder((mvcBuilder, _) =>
{
    mvcBuilder.AddApplicationPart(typeof(DocumentationController).Assembly)
        .AddControllersAsServices();
}).ConfigDependentServices(services =>
{
    services.AddEndpointsApiExplorer();
});

Mo.AddSwagger(o =>
{
    o.AppName = "Monica.Docs API";
    o.Version = "v1";
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