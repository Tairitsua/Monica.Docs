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
        <section className="hero hero-redesign shell" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow hero-reveal">{copy.heroEyebrow}</p>
            <h1 id="hero-title" className="hero-title">
              {copy.heroLines.map((line, index) => (
                <span className={`hero-line hero-reveal${index > 1 ? " accent-line" : ""}`} key={line}>{line}</span>
              ))}
            </h1>
            <p className="hero-description hero-reveal">{copy.heroDescription}</p>
            <div className="hero-actions hero-reveal">
              <a className="button button-primary" href="#start"><span>{copy.heroPrimary}</span><ArrowDownRight aria-hidden="true" size={17} /></a>
              <Link className="button button-quiet" href={localizedPath(locale, "/reference")}><span>{copy.heroSecondary}</span><ArrowRight aria-hidden="true" size={17} /></Link>
            </div>
            <dl className="hero-facts hero-reveal">
              {copy.facts.map((fact, index) => <div key={fact}><dt>0{index + 1}</dt><dd>{fact}</dd></div>)}
            </dl>
          </div>

          <div className="hero-model hero-reveal" aria-label={locale === "en" ? "Monica application model" : "Monica 应用模型"}>
            <div className="hero-model-header">
              <span>MONICA / APPLICATION MODEL</span>
              <i>{locale === "en" ? "ASP.NET Core remains visible" : "保留原生 ASP.NET Core"}</i>
            </div>
            <ModelLayer index="01" label={locale === "en" ? "Business behavior" : "业务行为"} value="ProjectUnits" detail="ApplicationService · DomainEvent · Job" />
            <ModelLayer index="02" label={locale === "en" ? "Infrastructure" : "基础设施"} value="Module graph" detail="Configuration · Repository · EventBus" />
            <ModelLayer index="03" label={locale === "en" ? "Runtime evidence" : "运行证据"} value="Inspectable host" detail="Health · Telemetry · Diagnostics" />
            <div className="hero-model-footer"><span />{locale === "en" ? "One vocabulary from source to runtime" : "从源码到运行时使用同一套语言"}</div>
          </div>
        </section>

        <div className="proof-ribbon" aria-label={locale === "en" ? "Release properties" : "发布属性"}>
          <div className="ticker-track"><span>.NET 10</span><i /><span>MIT LICENSE</span><i /><span>BUILDER-SCOPED</span><i /><span>OPEN TELEMETRY</span><i /><span>BILINGUAL DOCS</span><i /><span>ZERO WARNINGS</span><i /></div>
        </div>

        <section className="section starter-section starter-redesign shell reveal-section" id="start" aria-labelledby="start-title">
          <div className="starter-intro">
            <p className="section-folio">02 / {copy.starter.folio}</p>
            <h2 id="start-title">{copy.starter.title}</h2>
            <p>{copy.starter.description}</p>
            <ol className="starter-steps">{copy.starter.steps.map((step, index) => <li className={index === 0 ? "is-current" : undefined} key={step.title}><span>0{index + 1}</span><div><strong>{step.title}</strong><small>{step.body}</small></div></li>)}</ol>
            <Link className="text-link" href={localizedPath(locale, "/docs/getting-started/agent-setup")}><span>{copy.starter.quickStart}</span><ArrowUpRight aria-hidden="true" size={15} /></Link>
          </div>
          <StarterCode locale={locale} copy={copy.starter} />
        </section>

        <section className="section pillars-section outcomes-section reveal-section" id="concepts" aria-labelledby="outcomes-title">
          <div className="shell">
            <SectionHeading number="03" folio={copy.outcomes.folio} title={copy.outcomes.title} description={copy.outcomes.description} titleId="outcomes-title" />
            <div className="pillars-grid">
              <PillarCard number="01" className="structure-card" icon={<Blocks />} title={copy.outcomes.cards[0].title} body={copy.outcomes.cards[0].body}><ul><li>ApplicationService</li><li>DomainEventHandler</li><li>Repository</li></ul></PillarCard>
              <PillarCard number="02" className="compose-card" icon={<GitMerge />} title={copy.outcomes.cards[1].title} body={copy.outcomes.cards[1].body}><div className="mini-graph" aria-hidden="true"><span>Host</span><span>Config</span><span>Jobs</span><span>OTel</span></div></PillarCard>
              <PillarCard number="03" className="inspect-card" icon={<ScanEye />} title={copy.outcomes.cards[2].title} body={copy.outcomes.cards[2].body}><div className="inspect-readout"><span><i /> module.graph</span><b>healthy</b><span><i /> scheduler</span><b>3 active</b></div></PillarCard>
            </div>
          </div>
        </section>

        <section className="section how-section shell reveal-section" id="example" aria-labelledby="how-title">
          <SectionHeading number="04" folio={copy.how.folio} title={copy.how.title} description={copy.how.description} titleId="how-title" />
          <div className="how-layout">
            <ArchitectureTrace locale={locale} copy={copy.trace} />
            <div className="concept-flow" aria-label={copy.how.flowLabel}>
              {copy.how.steps.map((step) => (
                <article key={step.label}>
                  <span>{step.label}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              ))}
              <p className="concept-flow-note">{copy.how.note}</p>
            </div>
          </div>
          <div className="how-surfaces">
            <h3>{copy.how.surfacesTitle}</h3>
            <RuntimeSurfaces locale={locale} tabs={copy.how.tabs} captions={copy.how.captions} />
          </div>
        </section>

        <section className="section adoption-section reveal-section" id="adopt" aria-labelledby="adopt-title">
          <div className="shell">
            <SectionHeading number="05" folio={copy.adoption.folio} title={copy.adoption.title} titleId="adopt-title" compact />
            <div className="adoption-grid">
              {copy.adoption.cards.map((card, index) => {
                const href = index === 0
                  ? localizedPath(locale, "/docs/getting-started")
                  : index === 1
                    ? localizedPath(locale, "/modules")
                    : localizedPath(locale, "/docs/ecosystem");
                return <Link className="adoption-card" href={href} key={card.title}><span className="adoption-meta"><b>{card.marker}</b><i>{card.effort}</i></span><h3>{card.title}</h3><p>{card.body}</p><span className="card-action"><span>{card.action}</span><ArrowRight aria-hidden="true" size={16} /></span></Link>;
              })}
            </div>
          </div>
        </section>

        <section className="section modules-section release-section shell reveal-section" id="modules" aria-labelledby="modules-title">
          <SectionHeading number="06" folio={copy.modules.folio} title={copy.modules.title} description={copy.modules.description} titleId="modules-title" />
          <ModuleCatalog locale={locale} labels={copy.modules.tiers} descriptions={copy.modules.tierDescriptions} visibleLabel={copy.modules.visible} catalogLabel={copy.modules.catalog} />

          <div className="release-trust">
            <div className="release-trust-copy">
              <p className="section-folio">{copy.trust.folio}</p>
              <h3>{copy.trust.title}</h3>
              <p>{copy.trust.description}</p>
              <div className="trust-actions">
                <a className="button button-runtime" href={MONICA_GITHUB_URL} target="_blank" rel="noreferrer"><span>{copy.trust.github}</span><ArrowUpRight aria-hidden="true" size={16} /></a>
                <Link className="button button-quiet" href={localizedPath(locale, "/roadmap")}><span>{copy.trust.roadmap}</span><ArrowRight aria-hidden="true" size={16} /></Link>
              </div>
            </div>
            <div className="trust-ledger">{[".NET 10", "0 warnings", "MIT", "EN / 中文", "Reference app"].map((value, index) => <div key={value}><span>0{index + 1}</span><strong>{value}</strong><small>{copy.trust.ledger[index]}</small><Check aria-hidden="true" size={16} /></div>)}</div>
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}

function ModelLayer({ index, label, value, detail }: { index: string; label: string; value: string; detail: string }) {
  return <div className="model-layer"><span>{index}</span><div><small>{label}</small><strong>{value}</strong><i>{detail}</i></div><b aria-hidden="true">↗</b></div>;
}

function SectionHeading({ number, folio, title, description, titleId, compact = false }: { number: string; folio: string; title: string; description?: string; titleId: string; compact?: boolean }) {
  return <div className={`section-heading${compact ? " compact-heading" : ""}`}><p className="section-folio">{number} / {folio}</p><div><h2 id={titleId}>{title}</h2>{description && <p>{description}</p>}</div></div>;
}

function PillarCard({ number, className, icon, title, body, children }: { number: string; className: string; icon: React.ReactNode; title: string; body: string; children: React.ReactNode }) {
  return <article className={`pillar-card ${className}`}><div className="pillar-number">{number}</div><div className="pillar-icon" aria-hidden="true">{icon}</div><h3>{title}</h3><p>{body}</p>{children}</article>;
}
