using System.ComponentModel.DataAnnotations;
using Monica.Configuration.Annotations;
using Monica.Configuration.Models;

namespace Domains.Documentation.Configurations;

[Configuration(SectionName,
    DefinitionKey = "docs.workflow.demo",
    DisplayName = "Docs Workflow Demo",
    Description = "Demonstrates ordered list configuration, stable list item keys, nested retry settings, and mixed scalar value kinds.",
    OwnerModule = "Documentation Jobs",
    Category = "Demo",
    ReloadBehavior = ConfigurationReloadBehavior.OnlineReloadable)]
public sealed class DemoDocumentationWorkflowOptions
{
    public const string SectionName = "Demo:DocumentationWorkflow";

    [OptionSetting("Pipeline Name", Description = "Name of the documentation publishing pipeline.")]
    public string PipelineName { get; set; } = "docs-publish";

    [OptionSetting("Run Window Start", Description = "Local time when automatic publishing may begin.")]
    public DateTime RunWindowStart { get; set; } = DateTime.Today.AddHours(1);

    [OptionSetting("Steps", Description = "Ordered workflow steps. Each item uses Step Key as its stable identity.")]
    public List<DemoWorkflowStepOptions> Steps { get; set; } =
    [
        new()
        {
            StepKey = "scan",
            DisplayName = "Scan Markdown",
            Enabled = true,
            SortOrder = 10,
            Retry = new DemoRetryOptions
            {
                MaxAttempts = 3,
                Delay = TimeSpan.FromSeconds(5),
                Backoff = DemoRetryBackoff.Exponential
            }
        },
        new()
        {
            StepKey = "index",
            DisplayName = "Build Search Index",
            Enabled = true,
            SortOrder = 20,
            Retry = new DemoRetryOptions
            {
                MaxAttempts = 5,
                Delay = TimeSpan.FromSeconds(15),
                Backoff = DemoRetryBackoff.Linear
            }
        },
        new()
        {
            StepKey = "publish",
            DisplayName = "Publish Catalog",
            Enabled = true,
            SortOrder = 30,
            Retry = new DemoRetryOptions
            {
                MaxAttempts = 2,
                Delay = TimeSpan.FromSeconds(10),
                Backoff = DemoRetryBackoff.None
            }
        }
    ];
}

public sealed class DemoWorkflowStepOptions
{
    [Required]
    [RegularExpression("^[a-z][a-z0-9-]{1,31}$")]
    [OptionSetting("Step Key", Description = "Stable identity for this workflow step.", IsListItemKey = true)]
    public string StepKey { get; set; } = string.Empty;

    [Required]
    [OptionSetting("Display Name", Description = "Human-readable workflow step name.")]
    public string DisplayName { get; set; } = string.Empty;

    [OptionSetting("Enabled", Description = "Whether this step runs when the workflow executes.")]
    public bool Enabled { get; set; } = true;

    [Range(0, 1000)]
    [OptionSetting("Sort Order", Description = "Projection order for this step in the workflow.")]
    public int SortOrder { get; set; }

    [OptionSetting("Retry", Description = "Nested retry behavior for this workflow step.")]
    public DemoRetryOptions Retry { get; set; } = new();
}

public sealed class DemoRetryOptions
{
    [Range(0, 20)]
    [OptionSetting("Max Attempts", Description = "Maximum retry attempts after the first failure.")]
    public int MaxAttempts { get; set; } = 3;

    [OptionSetting("Delay", Description = "Base delay between retry attempts.")]
    public TimeSpan Delay { get; set; } = TimeSpan.FromSeconds(5);

    [OptionSetting("Backoff", Description = "Retry backoff algorithm.")]
    public DemoRetryBackoff Backoff { get; set; } = DemoRetryBackoff.Exponential;
}

public enum DemoRetryBackoff
{
    None,
    Linear,
    Exponential
}
