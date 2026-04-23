using Domains.Documentation.DomainServices;
using Microsoft.Extensions.Logging;
using Monica.JobScheduler.Abstractions;
using Monica.JobScheduler.Annotations;

namespace Domains.Documentation.Application.BackgroundWorkers;

/// <summary>
/// Periodically refreshes the markdown catalog so mounted docs content becomes visible without restarting Monica.Docs.
/// </summary>
[JobConfig(
    JobName = "Documentation Catalog Sync",
    Description = "Refreshes the Monica markdown document catalog so docs edits from mounted volumes or repository changes are reloaded automatically.",
    CronSchedule = Configurations.DocumentationApiOptions.DefaultDocsSyncCronExpression,
    MaxConcurrency = 1,
    RetryCount = 1,
    MaxExecutionTimeoutSeconds = 300)]
public sealed class WorkerDocumentationCatalogSync(
    DomainDocumentationCatalogSync domainService,
    ILogger<WorkerDocumentationCatalogSync> logger)
    : RecurringJob
{
    public override async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation("Running documentation catalog sync worker.");
        await domainService.ExecuteAsync(cancellationToken);
        await RecordExecutionLogAsync(
            "Refreshed the Monica markdown document catalog.",
            cancellationToken: cancellationToken);
    }
}
