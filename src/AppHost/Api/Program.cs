using Monica.Core.Modularity.Extensions;
using Monica.Docs.Shared.Platform.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.UnifiedConfigureBuilder();
builder.UseMonica();
var app = builder.Build();

app.UnifiedConfigureApplication();
app.Run();

public partial class Program;
