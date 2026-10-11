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
import { getDocumentationSlugs } from "@/lib/documentation-api";
import { knowledge } from "@/lib/knowledge";
import { localizedPath } from "@/lib/routes";

export function HomePage({ locale }: { locale: Locale }) {
  const copy = homeCopy[locale];
  const isChinese = locale === "zh-CN";
  const editorialLines = isChinese
    ? ["工程，自有章法。", "让 Agent", "与团队同频。"]
    : ["Engineering,", "in good", "company."];
  const readingPaths = [
    { title: isChinese ? "先为 Agent 准备好上下文" : "Give your agent the right context", body: isChinese ? "安装 Monica Guide，选择工作区，审核并验证变更。" : "Install Monica Guide, choose your workspace, then review and verify.", path: "/docs/getting-started/agent-setup" },
    { title: isChinese ? "找到适合你的工程路径" : "Find your engineering path", body: isChinese ? "从应用开发、模块扩展到框架贡献，在清晰的边界内工作。" : "From applications to extensions and framework contributions, work within clear boundaries.", path: "/docs/getting-started" },
    { title: isChinese ? "让 Skills 成为共同约定" : "Turn Skills into shared practice", body: isChinese ? "阅读真实的工程 Skills 与参考资料，让约定进入工作流。" : "Explore canonical engineering Skills and their references, directly from Monica.", path: "/skills" },
  ];

  return (
    <>
      <a className="skip-link" href="#main-content">{copy.skip}</a>
      <div className="page-grid" aria-hidden="true" />
      <SiteHeader locale={locale} nav={copy.nav} languageLabel={copy.languageLabel} demoLabel={copy.demoLabel} />

      <main id="main-content">
        <section className="hero editorial-hero shell" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow hero-reveal">{isChinese ? "面向 Agent 协作的 .NET 工程手册" : "A FIELD GUIDE TO BETTER ENGINEERING"}</p>
            <h1 id="hero-title" className="hero-title">
              {editorialLines.map((line, index) => (
                <span className={`hero-line hero-reveal${index > 1 ? " accent-line" : ""}`} key={line}>{line}</span>
              ))}
            </h1>
            <p className="hero-description hero-reveal">{isChinese ? "把架构约定、工程知识与实践，写成可阅读、可执行、可持续演进的共同语言。为开发者，也为编码 Agent。" : "A shared language for architecture, engineering knowledge, and practice. Built for .NET developers and the coding agents beside them."}</p>
            <div className="hero-actions hero-reveal">
              <a className="button button-primary" href="#start"><span>{copy.heroPrimary}</span><ArrowDownRight aria-hidden="true" size={17} /></a>
              <Link className="button button-quiet" href={localizedPath(locale, "/skills")}><span>{copy.heroSecondary}</span><ArrowRight aria-hidden="true" size={17} /></Link>
            </div>
          </div>

          <div className="editorial-system" aria-label={isChinese ? "文档、Skills 与框架共同组成 Monica 工程知识体系" : "Documentation, Skills, and the framework form the Monica engineering system"}>
            <div className="editorial-system-meta"><span>THE MONICA SYSTEM</span><span>FIG. 01 / 03</span></div>
            <div className="editorial-system-grid">
              <Link className="editorial-tile editorial-tile-read" href={localizedPath(locale, "/docs")}><strong>Read.</strong><span>{isChinese ? "文档 / 理解设计与约定" : "DOCS / UNDERSTAND THE DESIGN"}</span></Link>
              <Link className="editorial-tile editorial-tile-act" href={localizedPath(locale, "/skills")}><strong>Act.</strong><span>{isChinese ? "SKILLS / 让知识进入工作流" : "SKILLS / PUT KNOWLEDGE TO WORK"}</span></Link>
              <a className="editorial-tile editorial-tile-build" href="#example"><strong>Build<br />together.</strong><span>.NET FRAMEWORK<br />{isChinese ? "连接团队与 AGENT" : "CONNECTING TEAMS & AGENTS"}</span></a>
            </div>
            <p className="editorial-system-caption"><span>01 — {isChinese ? "共同语言" : "SHARED LANGUAGE"}</span>{isChinese ? "给人清晰的文档，给 Agent 明确的上下文。从同一套工程知识开始。" : "Clear documentation for people. Precise context for agents. One foundation to build on."}</p>
          </div>
        </section>

        <div className="editorial-stats shell" aria-label={isChinese ? "当前知识目录" : "Current knowledge catalog"}>
          <div><strong>{knowledge.skills.length}</strong><span>Agent Skills<small>{isChinese ? "源自 Monica 的工程约定" : "Canonical Monica engineering practices"}</small></span></div>
          <div><strong>{getDocumentationSlugs(locale).length}</strong><span>{isChinese ? "篇中文指南" : "English guides"}<small>{isChinese ? "当前版本的工程知识" : "Engineering knowledge for this version"}</small></span></div>
          <div><strong>中 / EN</strong><span>{isChinese ? "双语文档" : "Bilingual documentation"}<small>{isChinese ? "为人与 Agent 编写" : "Written for people and agents"}</small></span></div>
        </div>

        <section className="editorial-reading-room shell" aria-labelledby="reading-room-title">
          <div className="editorial-reading-heading"><h2 id="reading-room-title">{isChinese ? "从理解，到实践。" : "From understanding to practice."}</h2><span>THE READING ROOM / 01</span></div>
          <div className="editorial-reading-list">{readingPaths.map((item, index) => <Link key={item.path} href={localizedPath(locale, item.path)}><span className="editorial-reading-number">0{index + 1}</span><div><h3>{item.title}</h3><p>{item.body}</p></div><ArrowUpRight aria-hidden="true" size={22} /></Link>)}</div>
        </section>

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

function SectionHeading({ number, folio, title, description, titleId, compact = false }: { number: string; folio: string; title: string; description?: string; titleId: string; compact?: boolean }) {
  return <div className={`section-heading${compact ? " compact-heading" : ""}`}><p className="section-folio">{number} / {folio}</p><div><h2 id={titleId}>{title}</h2>{description && <p>{description}</p>}</div></div>;
}

function PillarCard({ number, className, icon, title, body, children }: { number: string; className: string; icon: React.ReactNode; title: string; body: string; children: React.ReactNode }) {
  return <article className={`pillar-card ${className}`}><div className="pillar-number">{number}</div><div className="pillar-icon" aria-hidden="true">{icon}</div><h3>{title}</h3><p>{body}</p>{children}</article>;
}
