using System.Threading.RateLimiting;
using Domains.Documentation.Application.HandlersQuery;
using Domains.Documentation.Configurations;
using Domains.Documentation.Providers;
using Domains.Documentation.Utilities;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Monica.Core;
using Monica.Core.Modularity.Extensions;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);
var documentationOptions = builder.Configuration
    .GetSection(DocumentationApiOptions.SectionName)
    .Get<DocumentationApiOptions>()
    ?? new DocumentationApiOptions();
var docsBasePath = UtilsDocumentationPathResolver.ResolveDocsBasePath(
    builder.Environment,
    documentationOptions);
var allowedOrigins = builder.Configuration
    .GetSection("PublicApi:AllowedOrigins")
    .Get<string[]>()
    ?.Where(static origin => !string.IsNullOrWhiteSpace(origin))
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray()
    ?? [];

builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();
builder.Services.Configure<DocumentationApiOptions>(
    builder.Configuration.GetSection(DocumentationApiOptions.SectionName));
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor
                               | ForwardedHeaders.XForwardedProto
                               | ForwardedHeaders.XForwardedHost;
    options.ForwardLimit = 1;
});
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            static _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 120,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));
});

builder.AddMonica(monica =>
{
    monica.ConfigureApplication(options =>
    {
        options.AppName = "Monica Documentation API";
        options.AppId = "monica-docs-api";
    });
    monica.ConfigureModuleSystem(options =>
    {
        options.DefaultApiGroupName = "Documentation";
    });
    monica.ConfigureTypeDiscovery(options =>
        options
            .ExcludeDefault()
            .Add(typeof(QueryHandlerGetDocTree).Assembly));

    monica.AddResultEnvelope().UseResultFieldNames(options => options.Status = "code");
    monica.AddDependencyInjection();
    monica.AddMediator();
    monica.AddAutoControllers();
    monica.AddSwagger(options =>
    {
        options.AppName = "Monica Documentation API";
        options.ApiVersion = "v1";
    });
    monica.AddCors().ConfigureDefaultPolicy(policy =>
    {
        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins);
        }
        else
        {
            policy.SetIsOriginAllowed(static _ => false);
        }

        policy
            .WithMethods("GET", "HEAD", "OPTIONS")
            .AllowAnyHeader();
    });
    monica.AddMarkdown(options => options.ParseFrontMatter = true)
        .EnableMultilingualDocuments()
        .AddDocumentGroup(
            key: documentationOptions.DocumentGroupKey,
            title: "Monica Docs",
            basePath: docsBasePath)
        .UseDocumentProvider<DocumentationMarkdownDocumentProvider>();
});

var app = builder.Build();

app.UseForwardedHeaders();
app.UseExceptionHandler();
app.UseRateLimiter();
app.Use(async (context, next) =>
{
    if (HttpMethods.IsGet(context.Request.Method)
        || HttpMethods.IsHead(context.Request.Method))
    {
        context.Response.OnStarting(() =>
        {
            if (context.Response.StatusCode == StatusCodes.Status200OK
                && context.Request.Path.StartsWithSegments("/api/v1/Documentation")
                && !context.Response.Headers.ContainsKey("Cache-Control"))
            {
                var isAsset = context.Request.Path.Value?.Contains("/asset", StringComparison.OrdinalIgnoreCase) == true;
                context.Response.Headers.CacheControl = isAsset
                    ? "public, max-age=300, stale-while-revalidate=86400"
                    : "public, max-age=60, stale-while-revalidate=300";
                context.Response.Headers.Vary = "Accept-Encoding, Origin";
            }

            return Task.CompletedTask;
        });
    }

    await next();
});
app.UseMonica();
app.MapMonica();

app.MapHealthChecks("/healthz").DisableRateLimiting();
app.MapGet("/", () => Results.Ok(new
    {
        name = "Monica Documentation API",
        docs = "/api/v1/Documentation/tree?locale=en-US",
        health = "/healthz"
    }))
    .ExcludeFromDescription()
    .DisableRateLimiting();

app.Run();
