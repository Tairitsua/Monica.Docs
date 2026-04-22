using Domains.Documentation.Configurations;
using Domains.Documentation.DomainServices;
using Microsoft.Extensions.Options;
using Monica.Core.HostedService.Abstractions;
using Monica.Core.HostedService.Models;
using Monica.Core.ObservableInstance.Abstractions;
using Monica.JobScheduler.Abstractions;
using Monica.Modules;

namespace Domains.Documentation.Application.BackgroundWorkers;

/// <summary>
/// Performs startup documentation synchronization and records observable hosted-service state transitions for the Monica.Docs demo host.
/// </summary>
public sealed class HostedServiceDocumentationCatalogSyncBootstrapper(
    DomainDocumentationCatalogSync domainService,
    IJobDefinitionCacheService jobDefinitionCacheService,
    IObservableInstanceRegistry observableManager,
    IOptions<ModuleHostedServiceOption> hostedServiceOptions,
    IOptions<DocumentationApiOptions> options)
    : MoHostedService(observableManager, hostedServiceOptions)
{
    private readonly DocumentationApiOptions _options = options.Value;

    /// <inheritdoc />
    public override string ServiceName => nameof(HostedServiceDocumentationCatalogSyncBootstrapper);

    /// <inheritdoc />
    protected override async Task OnStartingAsync(CancellationToken cancellationToken)
    {
        RecordState(
            "Bootstrapping documentation catalog startup sync.",
            HostedServiceState.Executing,
            logLevel: Microsoft.Extensions.Logging.LogLevel.Information);

        await domainService.ExecuteAsync(cancellationToken);
        await EnsureRecurringJobDefinitionAsync(cancellationToken);

        RecordState(
            "Documentation catalog startup sync completed successfully.",
            HostedServiceState.Running,
            logLevel: Microsoft.Extensions.Logging.LogLevel.Information);
    }

    private async Task EnsureRecurringJobDefinitionAsync(CancellationToken cancellationToken)
    {
        var jobKey = typeof(WorkerDocumentationCatalogSync).FullName
                     ?? throw new InvalidOperationException("Recurring docs sync job must have a full type name.");

        RecordState(
            $"Waiting for recurring job definition '{jobKey}'.",
            HostedServiceState.WaitingDependency,
            logLevel: Microsoft.Extensions.Logging.LogLevel.Information);

        var jobDefinition = await jobDefinitionCacheService.GetDefinitionAsync(jobKey, cancellationToken);
        if (jobDefinition is null)
        {
            RecordState(
                $"Unable to find the docs sync job definition '{jobKey}' during startup bootstrap.",
                HostedServiceState.Degraded,
                logLevel: Microsoft.Extensions.Logging.LogLevel.Warning);
            return;
        }

        if (string.Equals(jobDefinition.CronExpression, _options.DocsSyncCronExpression, StringComparison.Ordinal))
        {
            RecordState(
                $"Docs sync job definition already uses cron '{_options.DocsSyncCronExpression}'.",
                HostedServiceState.Running,
                logLevel: Microsoft.Extensions.Logging.LogLevel.Information);
            return;
        }

        RecordState(
            $"Updating docs sync job cron expression from '{jobDefinition.CronExpression}' to '{_options.DocsSyncCronExpression}'.",
            HostedServiceState.Executing,
            logLevel: Microsoft.Extensions.Logging.LogLevel.Information);

        jobDefinition.CronExpression = _options.DocsSyncCronExpression;
        await jobDefinitionCacheService.SaveDefinitionAsync(
            jobDefinition,
            publishChangeEvent: true,
            cancellationToken: cancellationToken);
    }
}
