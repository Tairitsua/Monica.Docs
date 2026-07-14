"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { Locale } from "@/content/home";
import { localizedPath } from "@/lib/routes";

type RuntimeSurfacesProps = {
  locale: Locale;
  tabs: readonly [string, string, string];
  captions: readonly [string, string, string];
};

const surfaceIds = ["graph", "units", "jobs"] as const;

export function RuntimeSurfaces({ locale, tabs, captions }: RuntimeSurfacesProps) {
  const [selected, setSelected] = useState(0);

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let next = selected;
    if (event.key === "ArrowLeft") next = (selected + 2) % 3;
    if (event.key === "ArrowRight") next = (selected + 1) % 3;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = 2;
    setSelected(next);
    document.getElementById(`surface-tab-${surfaceIds[next]}`)?.focus();
  };

  return (
    <>
      <p className="surface-live-caption" aria-live="polite">{captions[selected]}</p>
      <div className="surface-browser">
        <div className="surface-tabs" role="tablist" aria-label="Runtime surfaces">
          {surfaceIds.map((id, index) => (
            <button
              className={`surface-tab${selected === index ? " is-active" : ""}`}
              id={`surface-tab-${id}`}
              key={id}
              role="tab"
              aria-selected={selected === index}
              aria-controls={`surface-panel-${id}`}
              tabIndex={selected === index ? 0 : -1}
              onClick={() => setSelected(index)}
              onKeyDown={onKeyDown}
            >
              <span>0{index + 1}</span><b>{tabs[index]}</b>
            </button>
          ))}
        </div>

        <div className="surface-shell">
          <div className="surface-topbar">
            <span className="surface-breadcrumb">orders / runtime / <b>{["selected-capabilities", "project-units", "scheduler"][selected]}</b></span>
            <span className="surface-synced"><i /> {locale === "en" ? "source-backed selection" : "源码能力选摘"}</span>
          </div>
          <ModuleGraph locale={locale} hidden={selected !== 0} />
          <ProjectUnits hidden={selected !== 1} />
          <Scheduler hidden={selected !== 2} />
        </div>
      </div>
    </>
  );
}

function ModuleGraph({ locale, hidden }: { locale: Locale; hidden: boolean }) {
  return (
    <div className={`surface-panel graph-panel${hidden ? "" : " is-active"}`} id="surface-panel-graph" role="tabpanel" aria-labelledby="surface-tab-graph" hidden={hidden}>
      <div className="graph-canvas" aria-label={locale === "en" ? "Selected reference-host capabilities" : "参考主机能力选摘"}>
        <div className="graph-node host-node"><span>HOST</span><strong>Ordering.Api</strong><small>ready · reference host</small></div>
        <div className="graph-line line-a" aria-hidden="true" /><div className="graph-line line-b" aria-hidden="true" /><div className="graph-line line-c" aria-hidden="true" />
        <div className="graph-node node-project"><span>STRUCTURE</span><strong>ProjectUnits</strong><small>Ordering units</small></div>
        <div className="graph-node node-config"><span>STATE</span><strong>Configuration</strong><small>File provider</small></div>
        <div className="graph-node node-jobs"><span>EXECUTION</span><strong>JobScheduler</strong><small>1 recurring</small></div>
        <div className="graph-node node-otel"><span>EVIDENCE</span><strong>OpenTelemetry</strong><small>Prometheus</small></div>
      </div>
      <aside className="graph-inspector">
        <span className="micro-label">SELECTED MODULE</span><h3>JobScheduler</h3>
        <dl><div><dt>Phase</dt><dd>Application</dd></div><div><dt>Provider</dt><dd>InMemory</dd></div><div><dt>Scope</dt><dd>monica-reference-ordering</dd></div><div><dt>Schedule</dt><dd>60s</dd></div></dl>
        <Link className="inspector-action" href={localizedPath(locale, "/reference")}>Open reference details <ArrowRight aria-hidden="true" size={14} /></Link>
      </aside>
    </div>
  );
}

function ProjectUnits({ hidden }: { hidden: boolean }) {
  const rows = [
    ["CommandHandlerCreateOrder", "ApplicationService", "Ordering", "1"],
    ["CommandHandlerApproveOrder", "ApplicationService", "Ordering", "1"],
    ["EventOrderApproved", "DomainEvent", "Ordering", "0"],
    ["LocalEventHandlerOrderApproved", "EventHandler", "Ordering", "1"],
    ["WorkerOrderBacklogReport", "RecurringJob", "Ordering", "1"],
  ];
  return (
    <div className={`surface-panel units-panel${hidden ? "" : " is-active"}`} id="surface-panel-units" role="tabpanel" aria-labelledby="surface-tab-units" hidden={hidden}>
      <div className="units-toolbar"><span>Ordering ProjectUnits / 1 domain</span><span>Convention status: <b>valid</b></span></div>
      <div className="unit-table" role="table" aria-label="ProjectUnits">
        <div className="unit-row unit-head" role="row"><span>Name</span><span>Kind</span><span>Domain</span><span>Dependencies</span><span>Status</span></div>
        {rows.map(([name, kind, domain, dependencies]) => <div className="unit-row" role="row" key={name}><strong>{name}</strong><span>{kind}</span><span>{domain}</span><span>{dependencies}</span><b>READY</b></div>)}
      </div>
    </div>
  );
}

function Scheduler({ hidden }: { hidden: boolean }) {
  return (
    <div className={`surface-panel jobs-panel${hidden ? "" : " is-active"}`} id="surface-panel-jobs" role="tabpanel" aria-labelledby="surface-tab-jobs" hidden={hidden}>
      <div className="jobs-summary"><div><span>REGISTERED</span><strong>1</strong></div><div><span>SCHEDULE</span><strong>60s</strong></div><div><span>MAX CONCURRENCY</span><strong>1</strong></div></div>
      <div className="job-list">
        <Job name="WorkerOrderBacklogReport" detail="Ordering · every 1 min" status="scheduled" running heights={[30, 64, 44, 80, 52, 68]} />
        <Job name="Sample execution · 02" detail="Backlog report · completed" status="succeeded" heights={[50, 35, 70, 42, 36, 58]} />
        <Job name="Sample execution · 01" detail="Backlog report · completed" status="succeeded" heights={[22, 29, 28, 20, 32, 25]} />
      </div>
    </div>
  );
}

function Job({ name, detail, status, heights, running = false }: { name: string; detail: string; status: string; heights: readonly number[]; running?: boolean }) {
  return <article><div className={`job-state${running ? " running" : ""}`}><i /></div><div><strong>{name}</strong><span>{detail}</span></div><div className="job-spark" aria-hidden="true">{heights.map((height, index) => <i key={`${name}-${index}`} style={{ height: `${height}%` }} />)}</div><b>{status}</b></article>;
}
