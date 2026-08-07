"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import type { Locale, StarterCopy } from "@/content/home";
import manualDotnet from "@/content/manual-dotnet.json";
import { monicaGuidePrompts, type MonicaGuideGoal, type MonicaGuideHost } from "@/lib/monica-guide-prompts";
import { monicaRelease } from "@/lib/monica-release";

const CSHARP_CODE = manualDotnet.programLines.join("\n");

type SetupMode = "agent" | "manual";
type VisibleAgentHost = Exclude<MonicaGuideHost, "generic">;
type ManualTab = "cli" | "csharp";
type CopyFeedback = { target: string; status: "success" | "error" };

type StarterCodeProps = {
  locale: Locale;
  copy: StarterCopy;
};

export function StarterCode({ locale, copy }: StarterCodeProps) {
  const instanceId = useId().replaceAll(":", "");
  const manualFallback = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<SetupMode>("agent");
  const [agentHost, setAgentHost] = useState<VisibleAgentHost>("codex");
  const [goal, setGoal] = useState<MonicaGuideGoal>("application");
  const [manualTab, setManualTab] = useState<ManualTab>("cli");
  const [feedback, setFeedback] = useState<CopyFeedback | null>(null);
  const [failedValue, setFailedValue] = useState<string | null>(null);
  const localizedPrompts = monicaGuidePrompts.locales[locale];
  const cliCode = `dotnet new install ${monicaRelease.templatePackage}\ndotnet new monica-api -n Orders\ncd Orders && dotnet run`;
  const activePrompt = localizedPrompts[agentHost][goal];
  const genericPrompt = localizedPrompts.generic[goal];
  const activeCode = mode === "agent" ? activePrompt : manualTab === "cli" ? cliCode : CSHARP_CODE;
  const goalIndex = goal === "application" ? 0 : 1;

  useEffect(() => {
    if (feedback?.status !== "success") return;

    const timeout = window.setTimeout(() => setFeedback(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  useEffect(() => {
    if (!failedValue) return;
    manualFallback.current?.focus();
    manualFallback.current?.select();
  }, [failedValue]);

  const resetFeedback = () => {
    setFeedback(null);
    setFailedValue(null);
  };

  const copyCode = async (value: string, target: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setFailedValue(null);
      setFeedback({ target, status: "success" });
    } catch {
      setFailedValue(value);
      setFeedback({ target, status: "error" });
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

    resetFeedback();
    select(next);
    window.requestAnimationFrame(() => document.getElementById(idFor(next))?.focus());
  };

  const selectMode = (value: SetupMode) => {
    resetFeedback();
    setMode(value);
  };
  const selectHost = (value: VisibleAgentHost) => {
    resetFeedback();
    setAgentHost(value);
  };
  const selectGoal = (value: MonicaGuideGoal) => {
    resetFeedback();
    setGoal(value);
  };
  const selectManualTab = (value: ManualTab) => {
    resetFeedback();
    setManualTab(value);
  };

  const modeId = (value: SetupMode) => `${instanceId}-mode-tab-${value}`;
  const agentId = (value: VisibleAgentHost) => `${instanceId}-agent-tab-${value}`;
  const manualId = (value: ManualTab) => `${instanceId}-manual-tab-${value}`;
  const copied = (target: string) => feedback?.status === "success" && feedback.target === target;

  return (
    <div className="code-window setup-window" data-kicker={copy.windowKicker}>
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
              onClick={() => selectMode(value)}
              onKeyDown={(event) => selectByKey(event, ["agent", "manual"], mode, selectMode, modeId)}
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
        <div className="setup-before">
          <strong>{copy.beforeTitle}</strong>
          <ol>{copy.beforeItems.map((item) => <li key={item}>{item}</li>)}</ol>
        </div>

        <div className="code-subtoolbar setup-host-toolbar">
          <span>{copy.agentLabel}</span>
          <div className="code-tabs" role="tablist" aria-label={copy.agentLabel}>
            {(["codex", "claude-code"] as const).map((value, index) => (
              <button
                className={`code-tab${agentHost === value ? " is-active" : ""}`}
                id={agentId(value)}
                key={value}
                type="button"
                role="tab"
                aria-selected={agentHost === value}
                aria-controls={`${instanceId}-agent-panel-${value}`}
                tabIndex={agentHost === value ? 0 : -1}
                onClick={() => selectHost(value)}
                onKeyDown={(event) => selectByKey(event, ["codex", "claude-code"], agentHost, selectHost, agentId)}
              >
                {copy.agents[index]}
              </button>
            ))}
          </div>
        </div>

        {(["codex", "claude-code"] as const).map((value) => (
          <div
            className="guide-setup-panel"
            id={`${instanceId}-agent-panel-${value}`}
            key={value}
            role="tabpanel"
            aria-labelledby={agentId(value)}
            hidden={agentHost !== value}
          >
            {monicaGuidePrompts.isLocalDevelopment && <p className="local-prompt-note">{copy.localDevelopment}</p>}

            <fieldset className="setup-goals">
              <legend>{copy.goalLabel}</legend>
              <div className="goal-options">
                {(["application", "extension"] as const).map((goalValue, index) => {
                  const goalCopy = copy.goals[index];
                  return (
                    <label className={`goal-option${goal === goalValue ? " is-selected" : ""}`} key={goalValue}>
                      <input type="radio" name={`${instanceId}-${value}-goal`} value={goalValue} checked={goal === goalValue} onChange={() => selectGoal(goalValue)} />
                      <span className="goal-copy"><strong>{goalCopy.title}</strong><small>{goalCopy.body}</small></span>
                      <b>{goalCopy.badge}</b>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="setup-primary-action">
              <CopyButton
                className="setup-copy-button"
                copied={copied("active")}
                copyLabel={copy.goals[goalIndex].action}
                copiedLabel={copy.copied}
                onClick={() => copyCode(activePrompt, "active")}
              />
              <small>{agentHost === "codex" ? "Codex" : "Claude Code"} · {copy.goals[goalIndex].title}</small>
            </div>

            <div className="guide-verification">
              <h3>{copy.verifyTitle}</h3>
              <p>{copy.verifyDescription}</p>
              <ul>
                {[...copy.verifyCommon, ...copy.verifyByGoal[goal]].map((item) => <li key={item}><Check aria-hidden="true" size={14} />{item}</li>)}
              </ul>
            </div>

            <details className="full-prompt-details">
              <summary>{copy.fullPrompt}</summary>
              <div className="code-panel guide-prompt-panel"><pre><code>{activePrompt}</code></pre></div>
            </details>

            <details className="generic-fallback">
              <summary>{copy.genericFallback}</summary>
              <div className="generic-fallback-body">
                <pre><code>{genericPrompt}</code></pre>
                <CopyButton
                  copied={copied("generic")}
                  copyLabel={copy.copy}
                  copiedLabel={copy.copied}
                  onClick={() => copyCode(genericPrompt, "generic")}
                />
              </div>
            </details>

            <div className="starter-next-steps">
              <h3>{copy.afterTitle}</h3>
              <p>{copy.afterDescription}</p>
              <div>
                {copy.tasks.map((task, index) => {
                  const target = `task-${index}`;
                  return <article key={task.title}><strong>{task.title}</strong><p>{task.prompt}</p><CopyButton copied={copied(target)} copyLabel={copy.copyTask} copiedLabel={copy.copied} onClick={() => copyCode(task.prompt, target)} /></article>;
                })}
              </div>
            </div>
          </div>
        ))}
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
                onClick={() => selectManualTab(value)}
                onKeyDown={(event) => selectByKey(event, ["cli", "csharp"], manualTab, selectManualTab, manualId)}
              >
                {copy.manualTabs[index]}
              </button>
            ))}
          </div>
          <CopyButton copied={copied("manual")} copyLabel={copy.copy} copiedLabel={copy.copied} onClick={() => copyCode(activeCode, "manual")} />
        </div>

        <div className="code-panel" id={`${instanceId}-manual-panel-cli`} role="tabpanel" aria-labelledby={manualId("cli")} hidden={manualTab !== "cli"}>
          <pre><code><span className="code-comment"># Install the template</span>{"\n"}<span className="code-prompt">$</span> dotnet new install {monicaRelease.templatePackage}{"\n\n"}<span className="code-comment"># Create a modular API</span>{"\n"}<span className="code-prompt">$</span> dotnet new monica-api -n Orders{"\n"}<span className="code-prompt">$</span> cd Orders &amp;&amp; dotnet run{"\n\n"}<span className="code-output">✓ Monica is running</span>{"\n"}<span className="code-output">→ /healthz</span>{"\n"}<span className="code-output">→ /metrics</span></code></pre>
        </div>

        <div className="code-panel" id={`${instanceId}-manual-panel-csharp`} role="tabpanel" aria-labelledby={manualId("csharp")} hidden={manualTab !== "csharp"}>
          <pre><code>{CSHARP_CODE}</code></pre>
        </div>
      </div>

      {feedback?.status === "success" && <span className="sr-only" role="status" aria-live="polite">{copy.copied}</span>}
      {feedback?.status === "error" && failedValue && (
        <div className="copy-fallback" role="alert">
          <p>{copy.copyFailed}</p>
          <label htmlFor={`${instanceId}-manual-copy`}>{copy.selectManually}</label>
          <textarea id={`${instanceId}-manual-copy`} ref={manualFallback} readOnly rows={7} value={failedValue} />
        </div>
      )}
    </div>
  );
}

function CopyButton({ copied, copyLabel, copiedLabel, onClick, className = "" }: { copied: boolean; copyLabel: string; copiedLabel: string; onClick: () => void; className?: string }) {
  return (
    <button className={`copy-button ${className}`.trim()} type="button" onClick={onClick} aria-label={copied ? copiedLabel : copyLabel}>
      {copied ? <Check aria-hidden="true" size={14} /> : <Copy aria-hidden="true" size={14} />}
      <span>{copied ? copiedLabel : copyLabel}</span>
    </button>
  );
}
