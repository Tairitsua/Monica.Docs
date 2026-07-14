"use client";

import { Activity, Braces, Check, Network, RotateCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { type Locale, traceScenarios } from "@/content/home";

type ArchitectureTraceProps = {
  locale: Locale;
  copy: {
    label: string;
    scenarios: readonly [string, string, string];
    instruction: string;
    composition: string;
    runtime: string;
    completed: string;
    replay: string;
  };
};

export function ArchitectureTrace({ locale, copy }: ArchitectureTraceProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeStage, setActiveStage] = useState(4);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scenario = traceScenarios[selectedIndex];

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const replay = useCallback(() => {
    clearTimers();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActiveStage(4);
      return;
    }

    setActiveStage(1);
    [2, 3, 4].forEach((stage, index) => {
      timers.current.push(setTimeout(() => setActiveStage(stage), 260 * (index + 1)));
    });
  }, [clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  const selectScenario = (index: number) => {
    setSelectedIndex(index);
    requestAnimationFrame(replay);
  };

  return (
    <div className="trace-wrap hero-reveal" aria-label={copy.label}>
      <div className="trace-offset-label" aria-hidden="true">
        FIG. 01 / {locale === "en" ? "ILLUSTRATIVE WALKTHROUGH" : "示意架构演练"}
      </div>
      <div className="trace-panel">
        <div className="trace-header">
          <div className="live-label">
            <span className="live-dot" /> {copy.label}
          </div>
          <div className="trace-environment">reference-app / illustrative</div>
        </div>

        <div className="scenario-selector" role="group" aria-label={copy.label}>
          {traceScenarios.map((item, index) => (
            <button
              className={`scenario-chip${index === selectedIndex ? " is-active" : ""}`}
              type="button"
              key={item.id}
              aria-pressed={index === selectedIndex}
              onClick={() => selectScenario(index)}
            >
              {copy.scenarios[index]}
            </button>
          ))}
        </div>

        <div className="trace-flow">
          <TraceStage state={stageState(1, activeStage)} index="01" icon={<Check size={15} />} label={copy.instruction}>
            <strong>{scenario.instruction[locale]}</strong>
            <span className="stage-meta">{scenario.endpoint}</span>
          </TraceStage>
          <TraceConnector active={activeStage >= 2} />
          <TraceStage state={stageState(2, activeStage)} index="02" icon={<Braces size={15} />} label="ProjectUnit">
            <strong>{scenario.unit}</strong>
            <span className="stage-meta">{scenario.unitMeta}</span>
          </TraceStage>
          <TraceConnector active={activeStage >= 3} />
          <TraceStage state={stageState(3, activeStage)} index="03" icon={<Network size={15} />} label={copy.composition} className="module-stage">
            <div className="module-nodes">
              {scenario.modules.map((module) => <span key={module}>{module}</span>)}
            </div>
          </TraceStage>
          <TraceConnector active={activeStage >= 4} />
          <TraceStage state={stageState(4, activeStage)} index="04" icon={<Activity size={15} />} label={copy.runtime} className="runtime-stage">
            <strong className="runtime-result">{copy.completed} · {scenario.latency}</strong>
            <span className="stage-meta">{scenario.spans} · {scenario.traceId}</span>
          </TraceStage>
        </div>

        <div className="trace-footer">
          <button className="replay-button" type="button" onClick={replay}>
            <RotateCw aria-hidden="true" size={13} /> {copy.replay}
          </button>
          <span className="trace-footnote">{scenario.footnote[locale]}</span>
          <span className="sr-only" aria-live="polite">
            {scenario.unit}, {scenario.latency}
          </span>
        </div>
      </div>
    </div>
  );
}

function stageState(index: number, activeStage: number) {
  if (index < activeStage) return "is-complete";
  if (index === activeStage) return "is-active";
  return "";
}

function TraceStage({
  state,
  index,
  icon,
  label,
  className = "",
  children,
}: {
  state: string;
  index: string;
  icon: React.ReactNode;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <article className={`trace-stage ${className} ${state}`.trim()}>
      <div className="stage-index">{index}</div>
      <div className="stage-body">
        <span className="stage-label">{label}</span>
        {children}
      </div>
      <span className="stage-state" aria-hidden="true">{icon}</span>
    </article>
  );
}

function TraceConnector({ active }: { active: boolean }) {
  return <div className={`trace-connector${active ? " is-active" : ""}`} aria-hidden="true"><span /></div>;
}
