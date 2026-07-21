import { ArrowDownRight, ArrowRight, ArrowUpRight, Blocks, Check, GitMerge, ScanEye } from "lucide-react";
import Link from "next/link";

import { ArchitectureTrace } from "@/components/home/architecture-trace";
import { ModuleCatalog } from "@/components/home/module-catalog";
import { RuntimeSurfaces } from "@/components/home/runtime-surfaces";
import { SiteHeader } from "@/components/home/site-header";
import { StarterCode } from "@/components/home/starter-code";
import { SiteFooter } from "@/components/site/site-footer";
import { homeCopy, type Locale } from "@/content/home";
import { MONICA_GITHUB_URL } from "@/lib/external-links";
import { localizedPath } from "@/lib/routes";

export function HomePage({ locale }: { locale: Locale }) {
  const copy = homeCopy[locale];

  return (
    <>
      <a className="skip-link" href="#main-content">{copy.skip}</a>
      <div className="page-grid" aria-hidden="true" />
      <SiteHeader locale={locale} nav={copy.nav} languageLabel={copy.languageLabel} demoLabel={copy.demoLabel} />

      <main id="main-content">
        <section className="hero shell" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow hero-reveal">{copy.heroEyebrow}</p>
            <h1 id="hero-title" className="hero-title">
              {copy.heroLines.map((line, index) => (
                <span className={`hero-line hero-reveal${index > 1 ? " accent-line" : ""}`} key={line}>{line}</span>
              ))}
            </h1>
            <p className="hero-description hero-reveal">{copy.heroDescription}</p>
            <div className="hero-actions hero-reveal">
              <Link className="button button-primary" href={localizedPath(locale, "/reference")}><span>{copy.heroPrimary}</span><ArrowDownRight aria-hidden="true" size={17} /></Link>
              <Link className="button button-quiet" href={localizedPath(locale, "/docs")}><span>{copy.heroSecondary}</span><ArrowRight aria-hidden="true" size={17} /></Link>
            </div>
            <dl className="hero-facts hero-reveal">
              {copy.facts.map((fact, index) => <div key={fact}><dt>0{index + 1}</dt><dd>{fact}</dd></div>)}
            </dl>
          </div>
          <ArchitectureTrace locale={locale} copy={copy.trace} />
        </section>

        <div className="proof-ribbon" aria-label="Release properties">
          <div className="ticker-track"><span>.NET 10</span><i /><span>MIT LICENSE</span><i /><span>BUILDER-SCOPED</span><i /><span>OPEN TELEMETRY</span><i /><span>BILINGUAL DOCS</span><i /><span>ZERO WARNINGS</span><i /></div>
        </div>

        <section className="section proof-section shell reveal-section" id="proof" aria-labelledby="proof-title">
          <SectionHeading number="02" folio={copy.proof.folio} title={copy.proof.title} description={copy.proof.description} titleId="proof-title" />
          <div className="evidence-board">
            <aside className="evidence-rail">
              <div className="evidence-brandline"><span className="runtime-pulse" />{copy.proof.connected}</div>
              <div className="request-id"><span>FLOW</span><strong>ordering-approve</strong></div>
              <ol className="request-timeline"><li className="done"><span>00.0</span> HTTP ingress</li><li className="done"><span>03.8</span> ProjectUnit resolved</li><li className="done"><span>18.2</span> Unit of work opened</li><li className="done"><span>96.4</span> Approval committed</li><li className="done"><span>184.0</span> Local event handled</li></ol>
            </aside>
            <div className="evidence-main">
              <div className="evidence-toolbar"><div><span className="micro-label">{copy.proof.request}</span><strong>CommandHandlerApproveOrder.handle</strong></div><span className="health-badge">{copy.proof.badge}</span></div>
              <div className="metric-grid"><article><span>{copy.proof.latency}</span><strong>184<small>ms</small></strong><em>{copy.proof.metricNotes[0]}</em></article><article><span>{copy.proof.units}</span><strong>11</strong><em>{copy.proof.metricNotes[1]}</em></article><article><span>{copy.proof.jobs}</span><strong>1</strong><em>{copy.proof.metricNotes[2]}</em></article></div>
              <div className="span-waterfall" aria-label={locale === "en" ? "Illustrative request flow" : "示意请求流程"}>
                <div className="waterfall-scale"><span>0 ms</span><span>50</span><span>100</span><span>150</span><span>200</span></div>
                <WaterfallRow label="HTTP POST" left="0%" width="92%" value="184.0" />
                <WaterfallRow label="ProjectUnit" left="2%" width="12%" value="21.6" />
                <WaterfallRow label="UnitOfWork" left="9%" width="61%" value="121.8" />
                <WaterfallRow label="Repository" left="17%" width="34%" value="68.1" />
                <WaterfallRow label="Commit" left="48%" width="20%" value="40.0" />
                <WaterfallRow label="LocalEventBus" left="70%" width="14%" value="28.0" />
              </div>
            </div>
          </div>
          <p className="marginal-note">{copy.proof.note}</p>
        </section>

        <section className="section pillars-section reveal-section" id="product" aria-labelledby="pillars-title">
          <div className="shell">
            <SectionHeading number="03" folio={copy.pillars.folio} title={copy.pillars.title} titleId="pillars-title" compact />
            <div className="pillars-grid">
              <PillarCard number="01" className="structure-card" icon={<Blocks />} title={copy.pillars.cards[0].title} body={copy.pillars.cards[0].body}><ul><li>ApplicationService</li><li>DomainEventHandler</li><li>Repository</li></ul></PillarCard>
              <PillarCard number="02" className="compose-card" icon={<GitMerge />} title={copy.pillars.cards[1].title} body={copy.pillars.cards[1].body}><div className="mini-graph" aria-hidden="true"><span>Host</span><span>Config</span><span>Jobs</span><span>OTel</span></div></PillarCard>
              <PillarCard number="03" className="inspect-card" icon={<ScanEye />} title={copy.pillars.cards[2].title} body={copy.pillars.cards[2].body}><div className="inspect-readout"><span><i /> module.graph</span><b>healthy</b><span><i /> scheduler</span><b>3 active</b></div></PillarCard>
            </div>
          </div>
        </section>

        <section className="section starter-section shell reveal-section" id="start" aria-labelledby="start-title">
          <div className="starter-intro">
            <p className="section-folio">04 / {copy.starter.folio}</p>
            <h2 id="start-title">{copy.starter.title}</h2>
            <p>{copy.starter.description}</p>
            <ol className="starter-steps">{copy.starter.steps.map((step, index) => <li className={index === 0 ? "is-current" : undefined} key={step.title}><span>0{index + 1}</span><div><strong>{step.title}</strong><small>{step.body}</small></div></li>)}</ol>
            <Link className="text-link" href={localizedPath(locale, "/docs")}><span>{copy.starter.quickStart}</span><ArrowUpRight aria-hidden="true" size={15} /></Link>
          </div>
          <StarterCode copyLabel={copy.starter.copy} copiedLabel={copy.starter.copied} />
        </section>

        <section className="section fit-section reveal-section" id="fit" aria-labelledby="fit-title">
          <div className="shell">
            <SectionHeading number="05" folio={copy.fit.folio} title={copy.fit.title} description={copy.fit.description} titleId="fit-title" />
            <div className="fit-spectrum">
              {copy.fit.cards.map((card, index) => <article className={index === 1 ? "fit-selected" : undefined} key={card.title}><span className="fit-marker">{card.marker}</span>{index === 1 && <div className="fit-wordmark"><span className="monica-mini-mark" />MONICA</div>}<h3>{card.title}</h3><p>{card.body}</p><ul>{fitPoints[index].map((point) => <li key={point}>{point}</li>)}</ul></article>)}
            </div>
          </div>
        </section>

        <section className="section surfaces-section shell reveal-section" aria-labelledby="surfaces-title">
          <SectionHeading number="06" folio={copy.surfaces.folio} title={copy.surfaces.title} titleId="surfaces-title" />
          <RuntimeSurfaces locale={locale} tabs={copy.surfaces.tabs} captions={copy.surfaces.captions} />
        </section>

        <section className="section adoption-section reveal-section" id="adopt" aria-labelledby="adopt-title">
          <div className="shell">
            <SectionHeading number="07" folio={copy.adoption.folio} title={copy.adoption.title} titleId="adopt-title" compact />
            <div className="adoption-grid">
              {copy.adoption.cards.map((card, index) => <Link className="adoption-card" href={localizedPath(locale, index === 0 ? "/docs" : index === 1 ? "/modules" : "/reference")} key={card.title}><span className="adoption-meta"><b>{card.marker}</b><i>{card.effort}</i></span><h3>{card.title}</h3><p>{card.body}</p><span className="card-action"><span>{card.action}</span><ArrowRight aria-hidden="true" size={16} /></span></Link>)}
            </div>
          </div>
        </section>

        <section className="section modules-section shell reveal-section" id="modules" aria-labelledby="modules-title">
          <SectionHeading number="08" folio={copy.modules.folio} title={copy.modules.title} description={copy.modules.description} titleId="modules-title" />
          <ModuleCatalog locale={locale} labels={copy.modules.tiers} descriptions={copy.modules.tierDescriptions} visibleLabel={copy.modules.visible} catalogLabel={copy.modules.catalog} />
        </section>

        <section className="section trust-section reveal-section" id="trust" aria-labelledby="trust-title">
          <div className="shell trust-layout">
            <div className="trust-intro">
              <p className="section-folio inverted">09 / {copy.trust.folio}</p>
              <h2 id="trust-title">{copy.trust.title}</h2><p>{copy.trust.description}</p>
              <div className="trust-actions"><a className="button button-runtime" href={MONICA_GITHUB_URL} target="_blank" rel="noreferrer"><span>{copy.trust.github}</span><ArrowUpRight aria-hidden="true" size={16} /></a><Link className="button button-dark-quiet" href={localizedPath(locale, "/roadmap")}><span>{copy.trust.roadmap}</span><ArrowRight aria-hidden="true" size={16} /></Link></div>
            </div>
            <div className="trust-ledger">{[".NET 10", "0 warnings", "MIT", "EN / 中文", "Reference app"].map((value, index) => <div key={value}><span>0{index + 1}</span><strong>{value}</strong><small>{copy.trust.ledger[index]}</small><Check aria-hidden="true" size={16} /></div>)}</div>
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}

const fitPoints = [
  ["Native primitives", "Team-defined structure", "Manual runtime map"],
  ["ProjectUnit vocabulary", "Host-bound module graph", "Built-in evidence surfaces"],
  ["Broad abstraction", "Prescribed deployment", "Higher adoption surface"],
] as const;

function SectionHeading({ number, folio, title, description, titleId, compact = false }: { number: string; folio: string; title: string; description?: string; titleId: string; compact?: boolean }) {
  return <div className={`section-heading${compact ? " compact-heading" : ""}`}><p className="section-folio">{number} / {folio}</p><div><h2 id={titleId}>{title}</h2>{description && <p>{description}</p>}</div></div>;
}

function PillarCard({ number, className, icon, title, body, children }: { number: string; className: string; icon: React.ReactNode; title: string; body: string; children: React.ReactNode }) {
  return <article className={`pillar-card ${className}`}><div className="pillar-number">{number}</div><div className="pillar-icon" aria-hidden="true">{icon}</div><h3>{title}</h3><p>{body}</p>{children}</article>;
}

function WaterfallRow({ label, left, width, value }: { label: string; left: string; width: string; value: string }) {
  const style = { "--span-left": left, "--span-width": width } as React.CSSProperties;
  return <div className="span-row"><span>{label}</span><i style={style} /><b>{value}</b></div>;
}
