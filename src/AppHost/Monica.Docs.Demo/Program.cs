using Domains.Showcase.Application.BackgroundWorkers;
using Domains.Documentation.Configurations;
using Domains.Documentation.Providers;
using Domains.Documentation.Utilities;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Monica.Configuration.Bootstrap;
using Monica.Configuration.EfCore.DbContext;
using Monica.Core;
using Monica.Core.Modularity.Extensions;
using Monica.Modules;
using Monica.UI.Pages;
using Monica.UI.Theming;
using Platform.Infrastructure.RpcClient;

var builder = WebApplication.CreateBuilder(args);
var publicDemoMode = builder.Configuration.GetValue<bool>("PublicDemo:Enabled");
var managedSettingsPath = builder.Configuration["PublicDemo:ManagedSettingsPath"]
    ?? "docs-external-settings.json";
var configurationStoreConnectionString = ResolveConfigurationStoreConnectionString(builder);
var documentationApiOptions = builder.Configuration
    .GetSection(DocumentationApiOptions.SectionName)
    .Get<DocumentationApiOptions>()
    ?? new DocumentationApiOptions();
var docsBasePath = UtilsDocumentationPathResolver.ResolveDocsBasePath(
    builder.Environment,
    documentationApiOptions);
var configurationInputPlan = MonicaConfigurationInputPlan.Create(inputs => inputs
    .UseDbConfigurationStore(options => options.UseSqlite(configurationStoreConnectionString))
    .AddManagedJsonFile(
        managedSettingsPath,
        optional: false,
        reloadOnChange: true,
        options =>
        {
            options.DisplayName = "Docs External Demo Settings";
            options.Description = "Operator-managed JSON file registered through Monica.Configuration for source-chain and source-editing demos.";
            options.IsWritable = true;
        }));

builder.AddMonica(monica =>
{
    monica.ConfigureApplication(options =>
    {
        options.AppName = publicDemoMode ? "Monica Public Demo" : "Monica.Docs Demo";
        options.AppId = "monica-docs-demo";
    });
    monica.ConfigureModuleSystem(options =>
    {
        options.DefaultApiGroupName = "Documentation";
    });

    monica.AddResultEnvelope().UseResultFieldNames(options => options.Status = "code");
    monica.AddConfiguration(configurationInputPlan);
    monica.AddConfigurationUI();
    monica.AddEventBus().UseNoOpDistributedEventBus();
    monica.AddWebApi();

    monica.AddSwagger(options =>
    {
        options.AppName = "Monica.Docs Demo API";
        options.ApiVersion = "v1";
    });
    monica.AddProjectUnits(options =>
    {
        options.ConventionOptions.EnableNameConvention = true;
        options.ConventionOptions.NameConventionMode = ENameConventionMode.Strict;
    });
    monica.AddProjectUnitsUI();
    monica.AddHostedService();
    monica.AddRpcClient()
        .ConfigDomainInfoProvider(new MonicaDocsRpcClientDomainInfoProvider())
        .UseLocalTransport();
    monica.AddJobScheduler()
        .UseInMemoryProvider()
        .UseInMemoryMetadataRepository()
        .UseSchedulerScope("monica-docs-demo");
    monica.AddJobSchedulerUI();
    monica.AddObservableInstanceUI();

    monica.AddMarkdown(options =>
        {
            options.ParseFrontMatter = true;
        })
        .EnableMultilingualDocuments()
        .AddDocumentGroup(
            key: documentationApiOptions.DocumentGroupKey,
            title: "Monica Docs",
            basePath: docsBasePath)
        .UseDocumentProvider<DocumentationMarkdownDocumentProvider>();
    monica.AddMarkdownUI();
    monica.AddSwaggerUI().AddNavigationButton("Home", UISystemInfoPage.PAGE_URL);
    monica.AddSystemInfoUI().AddSwaggerLink();
    monica.AddUIShell(options =>
    {
        options.DefaultDarkMode = true;
        options.DefaultTheme = MonicaThemeKind.MaterialDesign3;
    })
        .AddRouteRedirect("/", UISystemInfoPage.PAGE_URL)
        .AddRouteRedirect("/configuration", "/configuration/state");
    monica.AddModuleSystemUI();
    monica.AddDependencyInjection();
});

var app = builder.Build();
await EnsureConfigurationDatabaseCreatedAsync(app.Services);

app.UseMonica();
app.MapMonica();
app.MapGet("/healthz", () => Results.Ok(new { status = "healthy", mode = publicDemoMode ? "public-demo" : "development-demo" }))
    .ExcludeFromDescription();
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
