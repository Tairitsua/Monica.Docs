using Domains.Documentation.Application.BackgroundWorkers;
using Domains.Documentation.Configurations;
using Domains.Documentation.Utilities;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Monica.Configuration.EfCore.DbContext;
using Monica.Core;
using Monica.Core.Modularity.Extensions;
using Monica.Modules;
using Monica.UI.Pages;
using Monica.UI.Theming;
using Platform.Infrastructure.RpcClient;

var builder = WebApplication.CreateBuilder(args);
var configurationStoreConnectionString = ResolveConfigurationStoreConnectionString(builder);

Mo.AddResultEnvelope().UseResultFieldNames(o => o.Status = "code");
Mo.AddConfiguration()
    .UseDbConfigurationStore((_, options) => options.UseSqlite(configurationStoreConnectionString))
    .AddManagedJsonFile(
        "docs-external-settings.json",
        optional: false,
        reloadOnChange: true,
        options =>
        {
            options.DisplayName = "Docs External Demo Settings";
            options.Description = "Operator-managed JSON file registered through Monica.Configuration for source-chain and source-editing demos.";
            options.IsWritable = true;
        });
Mo.AddConfigurationUI();
Mo.AddEventBus().UseNoOpDistributedEventBus();
Mo.AddWebApi();

Mo.AddSwagger(o =>
{
    o.AppName = "Monica.Docs API";
    o.ApiVersion = "v1";
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

var docsBasePath = UtilsDocumentationPathResolver.ResolveDocsBasePath(
    builder.Environment,
    documentationApiOptions);

Mo.AddMarkdown(o =>
    {
        o.ParseFrontMatter = true;
    })
    .EnableMultilingualDocuments()
    .AddDocumentGroup(
        key: documentationApiOptions.DocumentGroupKey,
        title: "Monica Docs",
        basePath: docsBasePath);
Mo.AddMarkdownUI();
Mo.AddSwaggerUI().AddNavigationButton("主页", UISystemInfoPage.PAGE_URL);
Mo.AddSystemInfoUI().AddSwaggerLink();
Mo.AddUIShell(o =>
{
    o.DefaultDarkMode = true;
    o.DefaultTheme = MonicaThemeKind.MaterialDesign3;
}).AddRouteRedirect("/", UISystemInfoPage.PAGE_URL);
Mo.AddModuleSystemUI();
Mo.AddDependencyInjection();

builder.UseMonica();

var app = builder.Build();
await EnsureConfigurationDatabaseCreatedAsync(app.Services);

app.UseMonica();
app.MapMonica();
app.Run();

static string ResolveConfigurationStoreConnectionString(WebApplicationBuilder builder)
{
    var configuredConnectionString = builder.Configuration.GetConnectionString("MonicaConfiguration")
        ?? "Data Source=App_Data/monica-configuration.sqlite";
    var sqliteConnectionStringBuilder = new SqliteConnectionStringBuilder(configuredConnectionString);

    if (!string.Equals(sqliteConnectionStringBuilder.DataSource, ":memory:", StringComparison.OrdinalIgnoreCase)
        && !Path.IsPathRooted(sqliteConnectionStringBuilder.DataSource))
    {
        sqliteConnectionStringBuilder.DataSource = Path.GetFullPath(
            Path.Combine(builder.Environment.ContentRootPath, sqliteConnectionStringBuilder.DataSource));
    }

    var databaseDirectory = Path.GetDirectoryName(sqliteConnectionStringBuilder.DataSource);
    if (!string.IsNullOrWhiteSpace(databaseDirectory))
    {
        Directory.CreateDirectory(databaseDirectory);
    }

    return sqliteConnectionStringBuilder.ConnectionString;
}

static async Task EnsureConfigurationDatabaseCreatedAsync(IServiceProvider services)
{
    await using var scope = services.CreateAsyncScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<ConfigurationDbContext>();
    await dbContext.Database.EnsureCreatedAsync();
}
