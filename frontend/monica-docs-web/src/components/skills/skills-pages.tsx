import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, FileText, Search } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DocsMarkdown } from "@/components/docs/docs-markdown";
import { ReadingNavigation } from "@/components/docs/reading-navigation";
import { LaunchShell } from "@/components/site/launch-shell";
import { remarkSkillMentions } from "@/components/skills/skill-mentions";
import type { Locale } from "@/content/home";
import {
  getSkill,
  getSkillFile,
  knowledge,
  rawSkillFileRoute,
  renderedSkillMarkdown,
  resolveSkillMarkdownHref,
  searchSkills,
  skillFileRoute,
  skillSourceUrl,
  type KnowledgeSkill,
} from "@/lib/knowledge";
import { localizedPath, oppositeLocale } from "@/lib/routes";

const labels = {
  en: {
    eyebrow: "MONICA / CANONICAL AGENT SKILLS",
    title: "The same Monica knowledge for agents and people.",
    description: "Browse the exact Agent Skills shipped from Monica source. Start with infrastructure usage, then open deeper development guidance when your task needs it.",
    search: "Search skills",
    searchPlaceholder: "Try RAG, UI, hosting, ProjectUnit…",
    searchAction: "Search",
    clear: "Clear search",
    infrastructure: "Use Monica infrastructure",
    infrastructureDescription: "Host-facing guides for composing and using Monica capabilities.",
    development: "Build with Monica",
    developmentDescription: "Architecture, implementation, testing, and contribution guidance.",
    noResults: "No skills match this search. Try a capability name such as hosting, AI, or UI.",
    resultCount: "skills",
    files: "files",
    back: "All skills",
    entrypoint: "Skill instructions",
    references: "Read the supporting references",
    raw: "Raw Markdown",
    github: "View source",
    install: "Install with Monica Guide",
    sourcePreview: "Source preview",
    release: "Release snapshot",
    uncommitted: "includes uncommitted changes",
    englishNote: "The canonical skill instructions are maintained in English. This page preserves their source wording.",
    from: "From",
  },
  "zh-CN": {
    eyebrow: "MONICA / 官方 AGENT SKILLS",
    title: "面向 Agent 和开发者的同一份 Monica 知识。",
    description: "浏览直接来自 Monica 源码的 Agent Skills。先选择基础设施使用指南，再按需阅读开发与架构指导。",
    search: "搜索技能",
    searchPlaceholder: "例如 RAG、UI、主机、ProjectUnit…",
    searchAction: "搜索",
    clear: "清除搜索",
    infrastructure: "使用 Monica 基础设施",
    infrastructureDescription: "面向应用主机的模块组合与使用指南。",
    development: "基于 Monica 开发",
    developmentDescription: "架构、实现、测试与贡献指导。",
    noResults: "没有匹配的技能。可以尝试 hosting、AI 或 UI 等能力名称。",
    resultCount: "个技能",
    files: "个文件",
    back: "全部技能",
    entrypoint: "技能说明",
    references: "继续阅读参考资料",
    raw: "原始 Markdown",
    github: "查看源码",
    install: "通过 Monica Guide 安装",
    sourcePreview: "源码预览",
    release: "发布快照",
    uncommitted: "包含未提交的改动",
    englishNote: "官方技能说明以英文维护。此页面保留原文内容。",
    from: "来源",
  },
} as const;

function KnowledgeSource({ locale }: { locale: Locale }) {
  const copy = labels[locale];
  const source = knowledge.source;
  return (
    <div className="skills-source" aria-label={locale === "en" ? "Knowledge source" : "知识来源"}>
      <span className="skills-source-kind">{source.mode === "release" ? copy.release : copy.sourcePreview}</span>
      <span>Monica {knowledge.frameworkVersion}</span>
      <span>{copy.from} {source.repository}@{source.ref}</span>
      {source.commit !== source.ref && <span>commit {source.commit}</span>}
      {source.dirty && <span className="skills-source-dirty">{copy.uncommitted}</span>}
    </div>
  );
}

function SkillCard({ locale, skill }: { locale: Locale; skill: KnowledgeSkill }) {
  const copy = labels[locale];
  return (
    <Link className="skills-card" href={skillFileRoute(locale, skill.name)}>
      <span className="skills-card-top"><code>{skill.name}</code><ArrowUpRight aria-hidden="true" size={17} /></span>
      <h3>{skill.title}</h3>
      <p>{skill.description}</p>
      <span className="skills-card-foot">
        <span>{skill.role === "router" ? "ROUTER" : "SKILL"}</span>
        <span>{skill.files.length} {copy.files}</span>
      </span>
    </Link>
  );
}

export function SkillsLandingPage({ locale, query }: { locale: Locale; query: string }) {
  const copy = labels[locale];
  const matches = searchSkills(query);
  const infrastructure = matches.filter((skill) => skill.name.startsWith("monica-infra-"));
  const development = matches.filter((skill) => !skill.name.startsWith("monica-infra-"));
  const indexPath = localizedPath(locale, "/skills");
  const alternate = localizedPath(oppositeLocale(locale), "/skills");

  return (
    <LaunchShell locale={locale} languageHref={alternate}>
      <section className="launch-hero shell skills-hero" aria-labelledby="skills-title">
        <div>
          <p className="launch-eyebrow">{copy.eyebrow}</p>
          <h1 id="skills-title">{copy.title}</h1>
          <p className="launch-lede">{copy.description}</p>
          <div className="skills-hero-actions">
            <Link className="button button-primary" href={`${localizedPath(locale, "/")}#start`}>{copy.install}<ArrowRight aria-hidden="true" size={16} /></Link>
            <a className="button button-quiet" href="/llms.txt">llms.txt<ArrowUpRight aria-hidden="true" size={16} /></a>
          </div>
        </div>
        <div className="launch-index" aria-hidden="true"><span>SKILLS</span><strong>{String(knowledge.skills.length).padStart(2, "0")}</strong></div>
      </section>

      <section className="skills-catalog shell" aria-label={copy.search}>
        <KnowledgeSource locale={locale} />
        <form className="skills-search" action={indexPath} method="get" role="search">
          <label htmlFor="skills-query">{copy.search}</label>
          <div className="skills-search-control">
            <Search aria-hidden="true" size={19} />
            <input id="skills-query" type="search" name="q" defaultValue={query} placeholder={copy.searchPlaceholder} />
            <button type="submit">{copy.searchAction}</button>
          </div>
          {query && <Link href={indexPath}>{copy.clear}</Link>}
        </form>
        <p className="skills-count">{matches.length} {copy.resultCount}</p>
        {matches.length === 0 && <p className="skills-empty">{copy.noResults}</p>}
        {infrastructure.length > 0 && (
          <section className="skills-group" aria-labelledby="infra-skills-title">
            <div className="skills-group-heading"><span>01 / INFRASTRUCTURE</span><h2 id="infra-skills-title">{copy.infrastructure}</h2><p>{copy.infrastructureDescription}</p></div>
            <div className="skills-grid">{infrastructure.map((skill) => <SkillCard locale={locale} skill={skill} key={skill.name} />)}</div>
          </section>
        )}
        {development.length > 0 && (
          <section className="skills-group" aria-labelledby="development-skills-title">
            <div className="skills-group-heading"><span>02 / DEVELOPMENT</span><h2 id="development-skills-title">{copy.development}</h2><p>{copy.developmentDescription}</p></div>
            <div className="skills-grid">{development.map((skill) => <SkillCard locale={locale} skill={skill} key={skill.name} />)}</div>
          </section>
        )}
      </section>
    </LaunchShell>
  );
}

export function SkillArticlePage({ locale, skillName, filePath }: { locale: Locale; skillName: string; filePath: string }) {
  const skill = getSkill(skillName);
  const file = getSkillFile(skillName, filePath);
  if (!skill || !file) {
    notFound();
  }

  const copy = labels[locale];
  const alternate = skillFileRoute(oppositeLocale(locale), skill.name, file.path);
  const files = [...skill.files].sort((a, b) =>
    a.path === "SKILL.md" ? -1 : b.path === "SKILL.md" ? 1 : a.path.localeCompare(b.path),
  );
  const references = files.filter((item) => item.path !== "SKILL.md");
  const hrefResolver = (href: string, rawAsset = false) =>
    resolveSkillMarkdownHref(href, locale, skill.name, file.path, rawAsset);

  return (
    <LaunchShell locale={locale} languageHref={alternate} mainClassName="skills-article-main">
      <div className="skills-article-shell shell">
        <aside className="skills-sidebar">
          <Link className="docs-back-link" href={localizedPath(locale, "/skills")}><ArrowLeft aria-hidden="true" size={15} />{copy.back}</Link>
          <ReadingNavigation resetKey={`${skill.name}/${file.path}`} label={locale === "en" ? "Browse skill files" : "浏览技能文件"}>
            <div className="skills-sidebar-title"><BookOpen aria-hidden="true" size={18} /><span>{skill.name}</span></div>
            <nav aria-label={locale === "en" ? "Skill files" : "技能文件"}>
              {files.map((item) => (
                <Link key={item.path} href={skillFileRoute(locale, skill.name, item.path)} aria-current={item.path === file.path ? "page" : undefined}>
                  <FileText aria-hidden="true" size={15} /><span>{item.title}</span><small>{item.path}</small>
                </Link>
              ))}
            </nav>
          </ReadingNavigation>
        </aside>

        <article className="skills-article">
          <nav className="docs-breadcrumbs" aria-label={locale === "en" ? "Breadcrumb" : "面包屑导航"}>
            <Link href={localizedPath(locale, "/skills")}>{copy.back}</Link><i aria-hidden="true">/</i>
            {file.path === "SKILL.md" ? <b aria-current="page">{skill.title}</b> : <><Link href={skillFileRoute(locale, skill.name)}>{skill.title}</Link><i aria-hidden="true">/</i><b aria-current="page">{file.title}</b></>}
          </nav>
          <header className="skills-article-header">
            <p className="launch-eyebrow">{skill.role.toUpperCase()} / {file.path}</p>
            <h1>{file.path === "SKILL.md" ? skill.title : file.title}</h1>
            <p>{file.path === "SKILL.md" ? skill.description : skill.title}</p>
            <KnowledgeSource locale={locale} />
            {locale === "zh-CN" && <p className="skills-language-note" lang="zh-CN">{copy.englishNote}</p>}
            <div className="skills-file-actions">
              <a href={rawSkillFileRoute(skill.name, file.path)}>{copy.raw}<ArrowUpRight aria-hidden="true" size={15} /></a>
              {!knowledge.source.dirty && <a href={skillSourceUrl(skill.name, file.path)} target="_blank" rel="noreferrer">{copy.github}<ArrowUpRight aria-hidden="true" size={15} /></a>}
              <Link href={`${localizedPath(locale, "/")}#start`}>{copy.install}<ArrowRight aria-hidden="true" size={15} /></Link>
            </div>
          </header>

          <DocsMarkdown markdown={renderedSkillMarkdown(file.content)} locale={locale} currentSlug={skill.name} hrefResolver={hrefResolver} remarkPlugins={[remarkSkillMentions(locale)]} />
          {file.path === "SKILL.md" && references.length > 0 && (
            <section className="skills-references" aria-labelledby="skills-references-title">
              <h2 id="skills-references-title">{copy.references}</h2>
              <div>{references.map((item) => (
                <Link key={item.path} href={skillFileRoute(locale, skill.name, item.path)}>
                  <FileText aria-hidden="true" size={17} /><span><strong>{item.title}</strong><small>{item.path}</small></span><ArrowRight aria-hidden="true" size={16} />
                </Link>
              ))}</div>
            </section>
          )}
        </article>
      </div>
    </LaunchShell>
  );
}
