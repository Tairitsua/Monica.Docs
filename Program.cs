using Monica.Core;
using Monica.Core.Modularity.Extensions;
using Monica.Markdown.UIMarkdown.Models;
using Monica.Modules;

var builder = WebApplication.CreateBuilder(args);

// Register Monica UI + Markdown modules.
Mo.AddUIShell(o =>
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

// Keep routing explicit so module pipeline hooks can attach.
app.UseMonica();
app.MapMonica();
app.Run();
