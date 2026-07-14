"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Brand } from "@/components/home/brand";
import type { Locale } from "@/content/home";
import { localizedPath } from "@/lib/routes";

type SiteHeaderProps = {
  locale: Locale;
  nav: readonly [string, string, string, string, string];
  languageLabel: string;
  languageHref?: string;
};

export function SiteHeader({ locale, nav, languageLabel, languageHref }: SiteHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const alternateHref = languageHref ?? (locale === "en" ? "/zh-CN" : "/");
  const homeHref = localizedPath(locale, "/");
  const destinations = [
    `${homeHref}#product`,
    localizedPath(locale, "/reference"),
    localizedPath(locale, "/docs"),
    localizedPath(locale, "/modules"),
    localizedPath(locale, "/roadmap"),
  ] as const;

  useEffect(() => {
    const updateHeader = () => setIsScrolled(window.scrollY > 16);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  return (
    <header className={`site-header${isScrolled ? " is-scrolled" : ""}`}>
      <div className="header-inner shell">
        <Brand homeHref={`${homeHref}#top`} />

        <nav className="desktop-nav" aria-label={locale === "en" ? "Primary navigation" : "主导航"}>
          {nav.map((label, index) => (
            <Link href={destinations[index]} key={destinations[index]}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          {/* Locale changes reload the document so locale-scoped metadata and entrance animations reset together. */}
          <a
            className="language-toggle"
            href={alternateHref}
            hrefLang={locale === "en" ? "zh-CN" : "en"}
            aria-label={languageLabel}
          >
            <span className={locale === "en" ? "language-active" : undefined}>EN</span>
            <span aria-hidden="true">/</span>
            <span className={locale === "zh-CN" ? "language-active" : undefined}>中文</span>
          </a>
          <a
            className="github-link"
            href="https://github.com/Tairitsua/Monica"
            target="_blank"
            rel="noreferrer"
          >
            GitHub <ArrowUpRight aria-hidden="true" size={15} />
          </a>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            aria-label={isOpen ? (locale === "en" ? "Close navigation" : "关闭导航") : (locale === "en" ? "Open navigation" : "打开导航")}
            onClick={() => setIsOpen((value) => !value)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <nav
        className="mobile-nav shell"
        id="mobile-nav"
        aria-label={locale === "en" ? "Mobile navigation" : "移动导航"}
        hidden={!isOpen}
      >
        {nav.map((label, index) => (
          <Link href={destinations[index]} key={destinations[index]} onClick={() => setIsOpen(false)}>
            {label}
          </Link>
        ))}
        <a href={alternateHref} hrefLang={locale === "en" ? "zh-CN" : "en"}>
          {languageLabel}
        </a>
      </nav>
    </header>
  );
}
