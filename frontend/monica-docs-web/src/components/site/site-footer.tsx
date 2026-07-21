import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Brand } from "@/components/home/brand";
import { homeCopy, type Locale } from "@/content/home";
import { MONICA_DEMO_URL, MONICA_GITHUB_URL } from "@/lib/external-links";
import { localizedPath } from "@/lib/routes";

export function SiteFooter({ locale }: { locale: Locale }) {
  const copy = homeCopy[locale];
  const labels = locale === "en"
    ? { quick: "Quick start", architecture: "Reference", modules: "Modules", demo: "Live demo", roadmap: "Roadmap", contributing: "Contributing" }
    : { quick: "快速开始", architecture: "参考应用", modules: "模块目录", demo: "在线演示", roadmap: "路线图", contributing: "参与贡献" };

  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Brand homeHref={`${localizedPath(locale, "/")}#top`} compact />
          <p>{copy.footer.statement}</p>
        </div>
        <div className="footer-links">
          <span>{copy.footer.learn}</span>
          <Link href={localizedPath(locale, "/docs")}>{labels.quick}</Link>
          <Link href={localizedPath(locale, "/reference")}>{labels.architecture}</Link>
          <Link href={localizedPath(locale, "/modules")}>{labels.modules}</Link>
        </div>
        <div className="footer-links">
          <span>{copy.footer.project}</span>
          <a href={MONICA_DEMO_URL} target="_blank" rel="noreferrer">{labels.demo} <ArrowUpRight aria-hidden="true" /></a>
          <a href={MONICA_GITHUB_URL} target="_blank" rel="noreferrer">GitHub <ArrowUpRight aria-hidden="true" /></a>
          <Link href={localizedPath(locale, "/roadmap")}>{labels.roadmap}</Link>
          <a href={`${MONICA_GITHUB_URL}/blob/dev/CONTRIBUTING.md`} target="_blank" rel="noreferrer">{labels.contributing}</a>
        </div>
        <div className="footer-meta">
          <span>MONICA / 1.0.0-RC.2</span>
          <span>ENGLISH / 简体中文</span>
          <span>MIT / 2026</span>
        </div>
      </div>
      <div className="footer-end shell">
        <span>{copy.footer.closing[0]}</span>
        <span>{copy.footer.closing[1]}</span>
      </div>
    </footer>
  );
}
