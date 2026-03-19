using Monica.Core;
using Monica.Core.Modularity;
using Monica.Docs.Components;
using Monica.Markdown.UIMarkdown.Models;
using Monica.Modules;

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
    basePath: Path.Combine(builder.Environment.ContentRootPath, "docs"));


Mo.AddMarkdownUI();

builder.UseMonica();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    app.UseHsts();
}

// Keep routing explicit so module pipeline hooks can attach.
app.UseMonica();

app.MapMonica();
// app.MapStaticAssets();
// app.MapRazorComponents<App>()
//     .AddInteractiveServerRenderMode();

app.Run();
