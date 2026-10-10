using Domains.Documentation.Configurations;
using Domains.Documentation.DomainServices;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Monica.Core.HostedService.Abstractions;
using Monica.Core.HostedService.Models;
using Monica.Core.ObservableInstance.Abstractions;
using Monica.Core.Results;
using Monica.JobScheduler.Facades;
using Monica.JobScheduler.Models;
using Monica.JobScheduler.Models.Definitions;
using Monica.Modules;

namespace Domains.Showcase.Application.BackgroundWorkers;

/// <summary>
/// Performs startup documentation synchronization and records observable hosted-service state transitions for the Monica.Docs demo host.
/// </summary>
public sealed class HostedServiceDocumentationCatalogSyncBootstrapper(
    DomainDocumentationCatalogSync domainService,
    JobSchedulerFacade jobScheduler,
    IOptions<ModuleJobSchedulerOption> schedulerOptions,
    IObservableInstanceRegistry observableManager,
    IOptions<ModuleHostedServiceOption> hostedServiceOptions,
    IServiceScopeFactory serviceScopeFactory,
    IOptions<DocumentationApiOptions> options,
    ILogger<HostedServiceDocumentationCatalogSyncBootstrapper> logger)
    : MoHostedService(observableManager, hostedServiceOptions, serviceScopeFactory, logger)
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

        var ownerKey = schedulerOptions.Value.GetProjectName();
        var jobDefinition = await WaitForRecurringJobDefinitionAsync(
            new JobId(ownerKey, jobKey), cancellationToken);

        if (string.Equals(jobDefinition.EffectiveConfiguration.Schedule?.CronExpression, _options.DocsSyncCronExpression, StringComparison.Ordinal))
        {
            RecordState(
                $"Docs sync job definition already uses cron '{_options.DocsSyncCronExpression}'.",
                HostedServiceState.Running,
                logLevel: Microsoft.Extensions.Logging.LogLevel.Information);
            return;
        }

        RecordState(
            $"Updating docs sync job cron expression from '{jobDefinition.EffectiveConfiguration.Schedule?.CronExpression}' to '{_options.DocsSyncCronExpression}'.",
            HostedServiceState.Executing,
            logLevel: Microsoft.Extensions.Logging.LogLevel.Information);

        var scheduleOverride = jobDefinition.Policy.Overrides.ScheduleOverride ?? new JobScheduleOverride();
        var updateResult = await jobScheduler.UpdatePolicyAsync(
            ownerKey,
            jobKey,
            new JobPolicyChange
            {
                ExpectedConcurrencyStamp = jobDefinition.Policy.ConcurrencyStamp,
                Overrides = jobDefinition.Policy.Overrides with
                {
                    ScheduleOverride = scheduleOverride with { CronExpression = _options.DocsSyncCronExpression }
                }
            },
            cancellationToken);
        if (updateResult.IsFailed(out var updateError))
        {
            throw new InvalidOperationException($"Unable to update the docs sync job policy: {updateError}");
        }
    }

    private async Task<JobDefinition> WaitForRecurringJobDefinitionAsync(
        JobId jobId,
        CancellationToken cancellationToken)
    {
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeout.CancelAfter(TimeSpan.FromSeconds(30));
        try
        {
            while (true)
            {
                var result = await jobScheduler.GetDefinitionAsync(jobId, timeout.Token);
                if (result.IsFailed(out var error, out var definition))
                {
                    throw new InvalidOperationException($"Unable to load the docs sync job definition: {error}");
                }

                if (definition is not null)
                {
                    return definition;
                }

                await Task.Delay(TimeSpan.FromMilliseconds(100), timeout.Token);
            }
        }
        catch (OperationCanceledException exception) when (!cancellationToken.IsCancellationRequested)
        {
            throw new TimeoutException($"The docs sync job definition '{jobId}' was not published within 30 seconds.", exception);
        }
    }
}
