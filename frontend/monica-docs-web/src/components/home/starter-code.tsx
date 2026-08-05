"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useId, useState, type KeyboardEvent } from "react";

import type { Locale, StarterCopy } from "@/content/home";
import { monicaGuidePrompts } from "@/lib/monica-guide-prompts";
import { monicaRelease } from "@/lib/monica-release";

const CSHARP_CODE = `var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHealthChecks();

builder.AddMonica(monica =>
{
    monica.ConfigureApplication(options =>
    {
        options.ProjectName = "Orders";
        options.AppName = "Orders";
    });

    monica.ConfigureModuleSystem(options =>
    {
        options.DefaultApiGroupName = "Orders";
        options.EnableMinimalApiByDefault = true;
    });

    monica.AddOpenTelemetry()
        .UsePrometheusEndpoint();
});

var app = builder.Build();
app.UseMonica();
app.MapGet("/", () => "Monica is running.");
app.MapHealthChecks("/healthz");
app.MapMonica();
app.Run();`;

type SetupMode = "agent" | "manual";
type AgentHost = "codex" | "claude";
type ManualTab = "cli" | "csharp";
type CopyTarget = "active" | "generic";

type StarterCodeProps = {
  locale: Locale;
  copy: StarterCopy;
};

export function StarterCode({ locale, copy }: StarterCodeProps) {
  const instanceId = useId().replaceAll(":", "");
  const [mode, setMode] = useState<SetupMode>("agent");
  const [agentHost, setAgentHost] = useState<AgentHost>("codex");
  const [manualTab, setManualTab] = useState<ManualTab>("cli");
  const [copiedTarget, setCopiedTarget] = useState<CopyTarget | null>(null);
  const localizedPrompts = monicaGuidePrompts.locales[locale];
  const cliCode = `dotnet new install ${monicaRelease.templatePackage}\ndotnet new monica-api -n Orders\ncd Orders && dotnet run`;
  const activeCode = mode === "agent"
    ? localizedPrompts[agentHost]
    : manualTab === "cli" ? cliCode : CSHARP_CODE;

  useEffect(() => {
    if (!copiedTarget) return;

    const timeout = window.setTimeout(() => setCopiedTarget(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [copiedTarget]);

  const copyCode = async (value: string, target: CopyTarget) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedTarget(target);
    } catch {
      setCopiedTarget(null);
    }
  };

  const selectByKey = <T extends string>(
    event: KeyboardEvent<HTMLButtonElement>,
    values: readonly T[],
    current: T,
    select: (value: T) => void,
    idFor: (value: T) => string,
  ) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

    event.preventDefault();
    const currentIndex = values.indexOf(current);
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? values.length - 1
        : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + values.length) % values.length;
    const next = values[nextIndex];
    if (!next) return;

    select(next);
    window.requestAnimationFrame(() => document.getElementById(idFor(next))?.focus());
  };

  const modeId = (value: SetupMode) => `${instanceId}-mode-tab-${value}`;
  const agentId = (value: AgentHost) => `${instanceId}-agent-tab-${value}`;
  const manualId = (value: ManualTab) => `${instanceId}-manual-tab-${value}`;
  const copied = copiedTarget === "active";

  return (
    <div className="code-window" data-kicker={copy.windowKicker}>
      <div className="code-toolbar">
        <div className="code-tabs code-mode-tabs" role="tablist" aria-label={copy.modeLabel}>
          {(["agent", "manual"] as const).map((value, index) => (
            <button
              className={`code-tab code-mode-tab${mode === value ? " is-active" : ""}`}
              id={modeId(value)}
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              aria-controls={`${instanceId}-mode-panel-${value}`}
              tabIndex={mode === value ? 0 : -1}
              onClick={() => setMode(value)}
              onKeyDown={(event) => selectByKey(event, ["agent", "manual"], mode, setMode, modeId)}
            >
              {copy.modes[index]}
            </button>
          ))}
        </div>
      </div>

      <div
        id={`${instanceId}-mode-panel-agent`}
        role="tabpanel"
        aria-labelledby={modeId("agent")}
        hidden={mode !== "agent"}
      >
        <div className="code-subtoolbar">
          <div className="code-tabs" role="tablist" aria-label={copy.agentLabel}>
            {(["codex", "claude"] as const).map((value, index) => (
              <button
                className={`code-tab${agentHost === value ? " is-active" : ""}`}
                id={agentId(value)}
                key={value}
                type="button"
                role="tab"
                aria-selected={agentHost === value}
                aria-controls={`${instanceId}-agent-panel-${value}`}
                tabIndex={agentHost === value ? 0 : -1}
                onClick={() => setAgentHost(value)}
                onKeyDown={(event) => selectByKey(event, ["codex", "claude"], agentHost, setAgentHost, agentId)}
              >
                {copy.agents[index]}
              </button>
            ))}
          </div>
          <CopyButton copied={copied} copyLabel={copy.copy} copiedLabel={copy.copied} onClick={() => copyCode(activeCode, "active")} />
        </div>

        {(["codex", "claude"] as const).map((value) => (
          <div
            className="code-panel guide-prompt-panel"
            id={`${instanceId}-agent-panel-${value}`}
            key={value}
            role="tabpanel"
            aria-labelledby={agentId(value)}
            hidden={agentHost !== value}
          >
            {monicaGuidePrompts.isLocalDevelopment && <p className="local-prompt-note">{copy.localDevelopment}</p>}
            <pre><code>{localizedPrompts[value]}</code></pre>
          </div>
        ))}

        <details className="generic-fallback">
          <summary>{copy.genericFallback}</summary>
          <div className="generic-fallback-body">
            <pre><code>{localizedPrompts.generic}</code></pre>
            <CopyButton
              copied={copiedTarget === "generic"}
              copyLabel={copy.copy}
              copiedLabel={copy.copied}
              onClick={() => copyCode(localizedPrompts.generic, "generic")}
            />
          </div>
        </details>
      </div>

      <div
        id={`${instanceId}-mode-panel-manual`}
        role="tabpanel"
        aria-labelledby={modeId("manual")}
        hidden={mode !== "manual"}
      >
        <div className="code-subtoolbar">
          <div className="code-tabs" role="tablist" aria-label={copy.manualLabel}>
            {(["cli", "csharp"] as const).map((value, index) => (
              <button
                className={`code-tab${manualTab === value ? " is-active" : ""}`}
                id={manualId(value)}
                key={value}
                type="button"
                role="tab"
                aria-selected={manualTab === value}
                aria-controls={`${instanceId}-manual-panel-${value}`}
                tabIndex={manualTab === value ? 0 : -1}
                onClick={() => setManualTab(value)}
                onKeyDown={(event) => selectByKey(event, ["cli", "csharp"], manualTab, setManualTab, manualId)}
              >
                {copy.manualTabs[index]}
              </button>
            ))}
          </div>
          <CopyButton copied={copied} copyLabel={copy.copy} copiedLabel={copy.copied} onClick={() => copyCode(activeCode, "active")} />
        </div>

        <div className="code-panel" id={`${instanceId}-manual-panel-cli`} role="tabpanel" aria-labelledby={manualId("cli")} hidden={manualTab !== "cli"}>
          <pre><code><span className="code-comment"># Install the template</span>{"\n"}<span className="code-prompt">$</span> dotnet new install {monicaRelease.templatePackage}{"\n\n"}<span className="code-comment"># Create a modular API</span>{"\n"}<span className="code-prompt">$</span> dotnet new monica-api -n Orders{"\n"}<span className="code-prompt">$</span> cd Orders &amp;&amp; dotnet run{"\n\n"}<span className="code-output">✓ Monica is running</span>{"\n"}<span className="code-output">→ /healthz</span>{"\n"}<span className="code-output">→ /metrics</span></code></pre>
        </div>

        <div className="code-panel" id={`${instanceId}-manual-panel-csharp`} role="tabpanel" aria-labelledby={manualId("csharp")} hidden={manualTab !== "csharp"}>
          <pre><code>{CSHARP_CODE}</code></pre>
        </div>
      </div>

      <span className="sr-only" aria-live="polite">{copiedTarget ? copy.copied : ""}</span>
    </div>
  );
}

function CopyButton({ copied, copyLabel, copiedLabel, onClick }: { copied: boolean; copyLabel: string; copiedLabel: string; onClick: () => void }) {
  return (
    <button className="copy-button" type="button" onClick={onClick} aria-label={copied ? copiedLabel : copyLabel}>
      {copied ? <Check aria-hidden="true" size={14} /> : <Copy aria-hidden="true" size={14} />}
      <span>{copied ? copiedLabel : copyLabel}</span>
    </button>
  );
}
