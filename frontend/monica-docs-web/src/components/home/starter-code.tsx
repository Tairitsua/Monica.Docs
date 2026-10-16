"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import type { Locale, StarterCopy } from "@/content/home";
import manualDotnet from "@/content/manual-dotnet.json";
import { monicaGuidePrompts } from "@/lib/monica-guide-prompts";
import { monicaRelease } from "@/lib/monica-release";

const CSHARP_CODE = manualDotnet.programLines.join("\n");
const AGENT_TARGET_LABELS: Readonly<Record<string, string>> = {
  codex: "Codex",
  "claude-code": "Claude Code",
};
const SETUP_MODES = ["agent", "manual"] as const;
const MANUAL_TABS = ["cli", "csharp"] as const;

type SetupMode = (typeof SETUP_MODES)[number];
type ManualTab = (typeof MANUAL_TABS)[number];
type CopyFeedback = { target: string; status: "success" | "error" };

type StarterCodeProps = {
  locale: Locale;
  copy: StarterCopy;
};

export function StarterCode({ locale, copy }: StarterCodeProps) {
  const instanceId = useId().replaceAll(":", "");
  const manualFallback = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<SetupMode>("agent");
  const [manualTab, setManualTab] = useState<ManualTab>("cli");
  const [feedback, setFeedback] = useState<CopyFeedback | null>(null);
  const [failedValue, setFailedValue] = useState<string | null>(null);
  const universalPrompt = monicaGuidePrompts.locales[locale];
  const fallbackCommands = `${monicaGuidePrompts.fallback.installCommand}\n${monicaGuidePrompts.fallback.verifyCommand}`;
  const cliCode = `dotnet new install ${monicaRelease.templatePackage}\ndotnet new monica-api -n Orders\ncd Orders && dotnet run`;
  const activeManualCode = manualTab === "cli" ? cliCode : CSHARP_CODE;

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
  const selectManualTab = (value: ManualTab) => {
    resetFeedback();
    setManualTab(value);
  };

  const modeId = (value: SetupMode) => `${instanceId}-mode-tab-${value}`;
  const manualId = (value: ManualTab) => `${instanceId}-manual-tab-${value}`;
  const copied = (target: string) => feedback?.status === "success" && feedback.target === target;

  return (
    <div className="code-window setup-window" data-kicker={copy.windowKicker}>
      <div className="code-toolbar">
        <div className="code-tabs code-mode-tabs" role="tablist" aria-label={copy.modeLabel}>
          {SETUP_MODES.map((value, index) => (
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
              onKeyDown={(event) => selectByKey(event, SETUP_MODES, mode, selectMode, modeId)}
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

        <div className="guide-setup-panel">
          {monicaGuidePrompts.isLocalDevelopment && <p className="local-prompt-note">{copy.localDevelopment}</p>}

          <div className="setup-primary-action">
            <CopyButton
              className="setup-copy-button"
              copied={copied("active")}
              copyLabel={copy.promptAction}
              copiedLabel={copy.copied}
              onClick={() => copyCode(universalPrompt, "active")}
            />
            <small>{copy.promptContext}</small>
          </div>

          <div className="verified-hosts" aria-label={copy.verifiedLabel}>
            <div>
              <strong>{copy.verifiedLabel}</strong>
              <p>{copy.verifiedDescription}</p>
            </div>
            <ul>
              {monicaGuidePrompts.verifiedAgentTargets.map((target) => (
                <li key={target}>{AGENT_TARGET_LABELS[target] ?? target}</li>
              ))}
            </ul>
          </div>

          <div className="guide-verification">
            <h3>{copy.capabilitiesTitle}</h3>
            <p>{copy.capabilitiesDescription}</p>
            <ul>
              {copy.capabilities.map((item) => <li key={item}><Check aria-hidden="true" size={14} />{item}</li>)}
            </ul>
          </div>

          <details className="full-prompt-details">
            <summary>{copy.fullPrompt}</summary>
            <div className="code-panel guide-prompt-panel"><pre><code>{universalPrompt}</code></pre></div>
          </details>

          <details className="generic-fallback">
            <summary>{copy.genericFallback}</summary>
            <div className="generic-fallback-description">{copy.genericFallbackDescription}</div>
            <div className="generic-fallback-body">
              <pre><code>{fallbackCommands}</code></pre>
              <CopyButton
                copied={copied("generic")}
                copyLabel={copy.copy}
                copiedLabel={copy.copied}
                onClick={() => copyCode(fallbackCommands, "generic")}
              />
            </div>
          </details>

        </div>
      </div>

      <div
        id={`${instanceId}-mode-panel-manual`}
        role="tabpanel"
        aria-labelledby={modeId("manual")}
        hidden={mode !== "manual"}
      >
        <div className="code-subtoolbar">
          <div className="code-tabs" role="tablist" aria-label={copy.manualLabel}>
            {MANUAL_TABS.map((value, index) => (
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
                onKeyDown={(event) => selectByKey(event, MANUAL_TABS, manualTab, selectManualTab, manualId)}
              >
                {copy.manualTabs[index]}
              </button>
            ))}
          </div>
          <CopyButton copied={copied("manual")} copyLabel={copy.copy} copiedLabel={copy.copied} onClick={() => copyCode(activeManualCode, "manual")} />
        </div>

        <div className="code-panel" id={`${instanceId}-manual-panel-cli`} role="tabpanel" aria-labelledby={manualId("cli")} hidden={manualTab !== "cli"}>
          <pre><code><span className="code-comment"># Install the template</span>{"\n"}<span className="code-prompt">$</span> dotnet new install {monicaRelease.templatePackage}{"\n\n"}<span className="code-comment"># Create a modular API</span>{"\n"}<span className="code-prompt">$</span> dotnet new monica-api -n Orders{"\n"}<span className="code-prompt">$</span> cd Orders &amp;&amp; dotnet run{"\n\n"}<span className="code-output">✓ Monica is running</span>{"\n"}<span className="code-output">→ /health · /alive</span>{"\n"}<span className="code-output">→ /metrics</span></code></pre>
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
