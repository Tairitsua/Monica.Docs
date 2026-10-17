import { ArrowLeft, ArrowRight, BookOpen, Braces, Layers3, Radio } from "lucide-react";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { DocsMarkdown } from "@/components/docs/docs-markdown";
import { DocsSearch } from "@/components/docs/docs-search";
import { DocsTree } from "@/components/docs/docs-tree";
import { ReadingNavigation } from "@/components/docs/reading-navigation";
import { LaunchShell } from "@/components/site/launch-shell";
import type { Locale } from "@/content/home";
import { launchCopy } from "@/content/launch";
import { getDocumentationArticle, getDocumentationTree, retiredModuleDestination } from "@/lib/documentation-api";
import { docsPath, localizedPath, oppositeLocale } from "@/lib/routes";

export async function DocsLandingPage({ locale }: { locale: Locale }) {
  const copy = launchCopy[locale].docs;
  const tree = await getDocumentationTree(locale);
  const alternateLocale = oppositeLocale(locale);

  return (
    <LaunchShell locale={locale} languageHref={docsPath(alternateLocale)}>
      <section className="launch-hero shell docs-hero" aria-labelledby="docs-title">
        <div>
          <p className="launch-eyebrow">{copy.eyebrow}</p>
          <h1 id="docs-title">{copy.title}</h1>
          <p className="launch-lede">{copy.description}</p>
        </div>
        <div className="launch-index" aria-hidden="true"><span>DOCS</span><strong>01—03</strong></div>
      </section>

      <section className="docs-search-band">
        <div className="shell">
          <DocsSearch
            locale={locale}
            label={copy.searchLabel}
            placeholder={copy.searchPlaceholder}
            action={copy.searchAction}
            hint={copy.searchHint}
            noResults={copy.noResults}
          />
        </div>
      </section>

      <section className="launch-section shell docs-catalog-section" aria-labelledby="docs-map-title">
        <div className="launch-section-heading">
          <p>01 / {copy.catalog}</p>
          <h2 id="docs-map-title">{copy.catalog}</h2>
        </div>

        <div className="docs-landing-grid">
          <div className="docs-map-panel">
            {tree.data.length > 0
              ? <DocsTree locale={locale} items={tree.data} />
              : <p className="docs-empty-copy">{copy.unavailableBody}</p>}
          </div>
          <aside className="docs-paths" aria-label={locale === "en" ? "Recommended paths" : "推荐路径"}>
            <Link href={docsPath(locale, "getting-started")}>
              <BookOpen aria-hidden="true" />
              <span>01</span>
              <strong>{locale === "en" ? "Run the starter" : "运行入门项目"}</strong>
              <p>{locale === "en" ? "A five-minute, inspectable .NET 10 host." : "五分钟启动一个可检查的 .NET 10 主机。"}</p>
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href={docsPath(locale, "concepts/host-bound-composition")}>
              <Braces aria-hidden="true" />
              <span>02</span>
              <strong>{locale === "en" ? "Learn the model" : "理解应用模型"}</strong>
              <p>{locale === "en" ? "Host composition, ProjectUnits, and evidence." : "主机组合、ProjectUnit 与运行证据。"}</p>
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href={localizedPath(locale, "/skills")}>
              <Layers3 aria-hidden="true" />
              <span>03</span>
              <strong>{locale === "en" ? "Use the skills" : "使用 Skills"}</strong>
              <p>{locale === "en" ? "Read the same capability contracts as your agent." : "与 Agent 共享同一份能力契约。"}</p>
              <ArrowRight aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </section>
    </LaunchShell>
  );
}

export async function DocsArticlePage({ locale, slug }: { locale: Locale; slug: string }) {
  const destination = retiredModuleDestination(locale, slug);
  if (destination) permanentRedirect(destination);
  const copy = launchCopy[locale].docs;
  const [article, tree] = await Promise.all([
    getDocumentationArticle(locale, slug),
    getDocumentationTree(locale),
  ]);
  const alternateLocale = oppositeLocale(locale);
  const alternateSlug = article.data?.alternates.find((item) => item.locale.toLowerCase() === (alternateLocale === "en" ? "en-us" : "zh-cn"))?.slug;
  const languageHref = docsPath(alternateLocale, alternateSlug);

  if (!article.data) notFound();

  const document = article.data;
  const updatedDate = formatDate(document.lastModifiedUtc, locale);

  return (
    <LaunchShell locale={locale} languageHref={languageHref} mainClassName="docs-article-main">
      <div className="docs-article-shell shell">
        <aside className="docs-sidebar">
          <Link className="docs-back-link" href={docsPath(locale)}><ArrowLeft aria-hidden="true" size={15} />{copy.back}</Link>
          <DocsSearch
            locale={locale}
            label={copy.searchLabel}
            placeholder={copy.searchPlaceholder}
            action={copy.searchAction}
            hint={copy.searchHint}
            noResults={copy.noResults}
          />
          <ReadingNavigation resetKey={document.slug} label={locale === "en" ? "Browse documentation" : "浏览文档目录"}>
            <DocsTree locale={locale} items={tree.data} activeSlug={document.slug} compact />
          </ReadingNavigation>
        </aside>

        <article className="docs-article">
          <nav className="docs-breadcrumbs" aria-label={locale === "en" ? "Breadcrumb" : "面包屑导航"}>
            <Link href={docsPath(locale)}>{locale === "en" ? "Docs" : "文档"}</Link>
            {document.breadcrumbs.slice(1).map((breadcrumb, index) => (
              <span key={`${breadcrumb.title}-${index}`}>
                <i aria-hidden="true">/</i>
                {breadcrumb.slug && !breadcrumb.isCurrent
                  ? <Link href={docsPath(locale, breadcrumb.slug)}>{breadcrumb.title}</Link>
                  : <b aria-current={breadcrumb.isCurrent ? "page" : undefined}>{breadcrumb.title}</b>}
              </span>
            ))}
          </nav>
          <header className="docs-article-header">
            <p><Radio aria-hidden="true" size={14} />{locale === "en" ? "GUIDE" : "指南"}</p>
            <h1>{document.title}</h1>
            <div className="docs-article-meta">
              {document.tags.map((tag) => <span key={tag}>{tag}</span>)}
              <time dateTime={document.lastModifiedUtc}>{copy.updated}: {updatedDate}</time>
            </div>
          </header>
          {document.headings.some((heading) => heading.level >= 2 && heading.level <= 3) && (
            <details className="docs-mobile-toc">
              <summary>{copy.onThisPage}</summary>
              <nav aria-label={copy.onThisPage}>
                <ol>
                  {document.headings.filter((heading) => heading.level >= 2 && heading.level <= 3).map((heading) => (
                    <li className={heading.level === 3 ? "is-nested" : undefined} key={`${heading.id}-${heading.title}`}>
                      <a href={`#${heading.id}`}>{heading.title}</a>
                    </li>
                  ))}
                </ol>
              </nav>
            </details>
          )}
          <DocsMarkdown markdown={document.markdown} locale={locale} currentSlug={document.relativePath.split("/").slice(1).join("/")} />
          <nav className="docs-pagination" aria-label={locale === "en" ? "Adjacent documentation" : "相邻文档"}>
            {document.previous
              ? <Link href={docsPath(locale, document.previous.slug)}><span>{copy.previous}</span><strong><ArrowLeft aria-hidden="true" />{document.previous.title}</strong></Link>
              : <span />}
            {document.next && <Link href={docsPath(locale, document.next.slug)}><span>{copy.next}</span><strong>{document.next.title}<ArrowRight aria-hidden="true" /></strong></Link>}
          </nav>
        </article>

        <aside className="docs-toc">
          <span>{copy.onThisPage}</span>
          <ol>
            {document.headings.filter((heading) => heading.level >= 2 && heading.level <= 3).map((heading) => (
              <li className={heading.level === 3 ? "is-nested" : undefined} key={`${heading.id}-${heading.title}`}>
                <a href={`#${heading.id}`}>{heading.title}</a>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </LaunchShell>
  );
}

function formatDate(value: string, locale: Locale): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
