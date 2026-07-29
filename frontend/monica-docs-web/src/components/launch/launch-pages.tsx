import { ArrowRight, ArrowUpRight, Check, CircleDot, FlaskConical, PackageCheck, PlugZap, TerminalSquare } from "lucide-react";
import Link from "next/link";

import { LaunchShell } from "@/components/site/launch-shell";
import type { Locale } from "@/content/home";
import { launchCopy, packageCatalog, type PackageTier } from "@/content/launch";
import { MONICA_DEMO_URL, MONICA_GITHUB_URL } from "@/lib/external-links";
import { localizedPath, oppositeLocale } from "@/lib/routes";

const TEMPLATE_SOURCE_URL = `${MONICA_GITHUB_URL}/tree/dev/Monica.Templates`;
const TEMPLATE_PACKAGE = "Monica.Templates@1.0.0-rc.6";
const REFERENCE_SOURCE_URL = `${MONICA_GITHUB_URL}/tree/dev/examples/Monica.ReferenceApplication`;
const tiers: readonly PackageTier[] = ["stable", "integration", "labs"];

export function ModulesPage({ locale }: { locale: Locale }) {
  const copy = launchCopy[locale].modules;
  const tierIcons = [PackageCheck, PlugZap, FlaskConical] as const;

  return (
    <LaunchShell locale={locale} languageHref={localizedPath(oppositeLocale(locale), "/modules")}>
      <section className="launch-hero shell modules-hero" aria-labelledby="modules-page-title">
        <div>
          <p className="launch-eyebrow">{copy.eyebrow}</p>
          <h1 id="modules-page-title">{copy.title}</h1>
          <p className="launch-lede">{copy.description}</p>
        </div>
        <dl className="modules-counts">
          {copy.counts.map((count, index) => <div key={count}><dt>0{index + 1}</dt><dd>{count}</dd></div>)}
        </dl>
      </section>

      <nav className="tier-jump shell" aria-label={locale === "en" ? "Package maturity tiers" : "包成熟度层级"}>
        {tiers.map((tier, index) => {
          const Icon = tierIcons[index];
          return (
            <a href={`#tier-${tier}`} key={tier}>
              <Icon aria-hidden="true" />
              <span>0{index + 1}</span>
              <strong>{copy.tierNames[index]}</strong>
              <small>{copy.tierPromises[index]}</small>
              <ArrowRight aria-hidden="true" />
            </a>
          );
        })}
      </nav>

      <section className="launch-section shell package-ledger" aria-label={locale === "en" ? "Package catalog" : "包目录"}>
        {tiers.map((tier, index) => (
          <article className={`package-tier package-tier-${tier}`} id={`tier-${tier}`} key={tier}>
            <header>
              <p>0{index + 1} / {copy.tierNames[index]}</p>
              <div>
                <h2>{copy.tierNames[index]}</h2>
                <p>{copy.tierPromises[index]}</p>
              </div>
              <strong>{packageCatalog[tier].length.toString().padStart(2, "0")}</strong>
            </header>
            <ul>
              {packageCatalog[tier].map((packageName) => <li key={packageName}><i /><code>{packageName}</code></li>)}
            </ul>
          </article>
        ))}
      </section>

      <section className="shell maturity-boundary">
        <div><CircleDot aria-hidden="true" /><span>PUBLIC CONTRACT</span></div>
        <div><h2>{copy.boundaryTitle}</h2><p>{copy.boundaryBody}</p></div>
        <aside><strong>{copy.unpublishedTitle}</strong><p>{copy.unpublishedBody}</p></aside>
      </section>
    </LaunchShell>
  );
}

export function ReferencePage({ locale }: { locale: Locale }) {
  const copy = launchCopy[locale].reference;

  return (
    <LaunchShell locale={locale} languageHref={localizedPath(oppositeLocale(locale), "/reference")}>
      <section className="launch-hero shell reference-hero" aria-labelledby="reference-page-title">
        <div>
          <p className="launch-eyebrow">{copy.eyebrow}</p>
          <h1 id="reference-page-title">{copy.title}</h1>
          <p className="launch-lede">{copy.description}</p>
        </div>
        <a
          className="reference-signal"
          href={MONICA_DEMO_URL}
          target="_blank"
          rel="noreferrer"
          aria-label={locale === "en" ? "Open the live Monica demo" : "打开 Monica 在线演示"}
        >
          <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
          <strong>{locale === "en" ? "LIVE DEMO" : "在线演示"}<ArrowUpRight aria-hidden="true" size={15} /></strong>
        </a>
      </section>

      <section className="launch-section shell reference-path" aria-labelledby="template-title">
        <div className="reference-path-intro">
          <p>{copy.templateLabel}</p>
          <h2 id="template-title">{copy.templateTitle}</h2>
          <p>{copy.templateBody}</p>
          <a className="text-link" href={TEMPLATE_SOURCE_URL} target="_blank" rel="noreferrer">{copy.source}<ArrowUpRight aria-hidden="true" /></a>
        </div>
        <div className="reference-proof-grid">
          <CodeEvidence label={copy.runLabel} command={`dotnet new install ${TEMPLATE_PACKAGE}\ndotnet new monica-api --name Acme.Orders\ncd Acme.Orders\ndotnet run`} />
          <div className="endpoint-proof">
            <span>{copy.proofLabel}</span>
            <ul><li><code>/</code><small>application identity</small></li><li><code>/healthz</code><small>ASP.NET Core health checks</small></li><li><code>/metrics</code><small>OpenTelemetry metrics</small></li></ul>
          </div>
        </div>
      </section>

      <section className="reference-dark">
        <div className="launch-section shell reference-path reference-app" aria-labelledby="reference-app-title">
          <div className="reference-path-intro">
            <p>{copy.appLabel}</p>
            <h2 id="reference-app-title">{copy.appTitle}</h2>
            <p>{copy.appBody}</p>
            <a className="text-link" href={REFERENCE_SOURCE_URL} target="_blank" rel="noreferrer">{copy.source}<ArrowUpRight aria-hidden="true" /></a>
          </div>
          <div className="reference-architecture">
            <div className="architecture-tree">
              <span>{copy.architecture}</span>
              <pre>{`src/\n├ AppHost/Monica.Reference.Api\n├ Domains/Ordering\n└ Shared/\n  ├ Platform.Infrastructure\n  ├ Platform.Protocol\n  └ Platform.BuildingBlocks`}</pre>
            </div>
            <div className="dependency-chain">
              <span>{copy.dependency}</span>
              <ol><li>AppHost</li><li>Ordering</li><li>Platform.Infrastructure</li><li>Platform.Protocol</li><li>Platform.BuildingBlocks</li></ol>
            </div>
          </div>
          <div className="reference-run-row">
            <CodeEvidence label={copy.runLabel} command="dotnet run --project examples/Monica.ReferenceApplication/src/AppHost/Monica.Reference.Api/Monica.Reference.Api.csproj" />
            <div className="reference-endpoints">
              <span>{copy.endpoints}</span>
              <div>{["/api/v1/Ordering/orders", "/swagger", "/framework/units", "/metrics", "/healthz"].map((endpoint) => <code key={endpoint}>{endpoint}</code>)}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell reference-seam">
        <span>REPLACEMENT SEAM / PORT 5275</span>
        <h2>{copy.seamTitle}</h2>
        <p>{copy.seamBody}</p>
        <Link href={localizedPath(locale, "/docs/architecture")}>{locale === "en" ? "Read the architecture guide" : "阅读架构指南"}<ArrowRight aria-hidden="true" /></Link>
      </section>
    </LaunchShell>
  );
}

export function RoadmapPage({ locale }: { locale: Locale }) {
  const copy = launchCopy[locale].roadmap;

  return (
    <LaunchShell locale={locale} languageHref={localizedPath(oppositeLocale(locale), "/roadmap")}>
      <section className="launch-hero shell roadmap-hero" aria-labelledby="roadmap-page-title">
        <div>
          <p className="launch-eyebrow">{copy.eyebrow}</p>
          <h1 id="roadmap-page-title">{copy.title}</h1>
          <p className="launch-lede">{copy.description}</p>
        </div>
        <div className="roadmap-version"><span>{copy.currentLabel}</span><strong>1.0.0</strong><i>RC.6</i></div>
      </section>

      <section className="shell roadmap-current">
        <div><span className="runtime-pulse" />{copy.currentLabel}</div>
        <h2>{copy.currentTitle}</h2>
        <p>{copy.currentBody}</p>
      </section>

      <section className="launch-section shell roadmap-timeline" aria-label={locale === "en" ? "Release phases" : "发布阶段"}>
        {copy.phases.map((phase, index) => (
          <article className={index === 0 ? "is-current" : undefined} key={phase.marker}>
            <div><span>{phase.marker}</span><i /></div>
            <strong>{phase.state}</strong>
            <h2>{phase.title}</h2>
            <p>{phase.body}</p>
          </article>
        ))}
      </section>

      <section className="roadmap-evidence">
        <div className="shell roadmap-evidence-grid">
          <div>
            <p>QUALITY / RELEASE</p>
            <h2>{copy.gatesTitle}</h2>
            <ol>{copy.gates.map((gate, index) => <li key={gate}><span>{String(index + 1).padStart(2, "0")}</span><p>{gate}</p><Check aria-hidden="true" /></li>)}</ol>
          </div>
          <aside>
            <p>BOUNDARIES / HONESTY</p>
            <h2>{copy.promisesTitle}</h2>
            <ul>{copy.promises.map((promise) => <li key={promise}><i />{promise}</li>)}</ul>
            <strong>{copy.dateNote}</strong>
          </aside>
        </div>
      </section>
    </LaunchShell>
  );
}

function CodeEvidence({ label, command }: { label: string; command: string }) {
  return (
    <div className="code-evidence">
      <div><TerminalSquare aria-hidden="true" /><span>{label}</span><i>bash</i></div>
      <pre><code>{command}</code></pre>
    </div>
  );
}
