using Domains.Documentation.Application.BackgroundWorkers;
using Domains.Documentation.Configurations;
using Domains.Documentation.DomainServices;
using Monica.Core;
using Monica.Core.Modularity.Extensions;
using Monica.Modules;
using Monica.UI.Pages;
using Platform.Infrastructure.RpcClient;

var builder = WebApplication.CreateBuilder(args);

Mo.AddResultEnvelope().UseResultFieldNames(o => o.Status = "code");
Mo.AddConfiguration();
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
Mo.AddProjectUnitsUI();
Mo.AddHostedService();
Mo.AddRpcClient()
    .ConfigDomainInfoProvider(new MonicaDocsRpcClientDomainInfoProvider())
    .UseLocalTransport();
Mo.AddJobScheduler(o =>
    {
        o.ProjectName = "Monica.Docs";
    })
    .UseInMemoryProvider()
    .UseInMemoryMetadataRepository()
    .UseSchedulerScope("monica-docs");
Mo.AddJobSchedulerUI();
Mo.AddObservableInstanceUI();

var documentationApiOptions = builder.Configuration
    .GetSection(DocumentationApiOptions.SectionName)
    .Get<DocumentationApiOptions>()
    ?? new DocumentationApiOptions();
builder.Services.Configure<DocumentationApiOptions>(
    builder.Configuration.GetSection(DocumentationApiOptions.SectionName));

var docsBasePath = new DomainDocumentationPathResolver(
        builder.Environment,
        Microsoft.Extensions.Options.Options.Create(documentationApiOptions))
    .ResolveDocsBasePath();

Mo.AddMarkdown(o =>
    {
        o.ParseFrontMatter = true;
    })
    .AddDocumentGroup(
        key: documentationApiOptions.DocumentGroupKey,
        title: "Monica Docs",
        basePath: docsBasePath);
Mo.AddMarkdownUI();
Mo.AddSwaggerUI().AddNavigationButton("主页", UISystemInfoPage.PAGE_URL);
Mo.AddSystemInfoUI().AddSwaggerLink();
Mo.AddUIShell().AddRouteRedirect("/", UISystemInfoPage.PAGE_URL);
Mo.AddModuleSystemUI();

builder.Services.AddHostedService<HostedServiceDocumentationCatalogSyncBootstrapper>();

builder.UseMonica();

var app = builder.Build();

app.UseMonica();
app.MapMonica();
app.Run();

return;
