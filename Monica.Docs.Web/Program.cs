using Monica.Core;
using Monica.Core.Modularity.BuilderWrapper;
using Monica.Docs.Web.Components;
using Monica.Markdown.UIMarkdown.Models;
using Monica.Modules;

// Enable Mo module system (Harmony patches).
Mo.Initialize();

var builder = WebApplication.CreateBuilder(args);

// Register Monica UI + Markdown modules.
Mo.AddUICore(o =>
{
    o.EnableDebug = builder.Environment.IsDevelopment();
    o.EnableMarkdown = true;
})
.AddRouteRedirect("/", MarkdownViewerLocation.PageUrl);

Mo.AddMarkdown(o =>
{
    o.ParseFrontMatter = true;
})
.AddDocumentGroup(
    key: "monica",
    title: "Monica Docs",
    basePath: Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", "..", "docs")));

Mo.AddMarkdownUI();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    app.UseHsts();
}

// Keep routing explicit so module pipeline hooks can attach.
app.UseRouting();

// Triggers module endpoint configuration when Harmony patching is unavailable.
// (Safe no-op when patching is successful.)
#pragma warning disable CS0618
app.UseMoEndpoints();
#pragma warning restore CS0618

app.UseHttpsRedirection();
app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();
