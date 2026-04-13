using Domains.Documentation.Configurations;
using Monica.Core;
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

Mo.AddResultEnvelope().UseResultFieldNames(o => o.Status = "code");
Mo.AddConfiguration(o =>
{
    o.AppConfiguration = builder.Configuration;
});
Mo.AddEventBus().UseNoOpDistributedEventBus();
Mo.AddWebApi();

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
