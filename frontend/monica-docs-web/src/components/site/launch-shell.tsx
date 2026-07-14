import type { ReactNode } from "react";

import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { homeCopy, type Locale } from "@/content/home";

type LaunchShellProps = {
  locale: Locale;
  languageHref: string;
  children: ReactNode;
  mainClassName?: string;
};

export function LaunchShell({ locale, languageHref, children, mainClassName = "launch-main" }: LaunchShellProps) {
  const copy = homeCopy[locale];

  return (
    <>
      <a className="skip-link" href="#main-content">{copy.skip}</a>
      <div className="page-grid" aria-hidden="true" />
      <SiteHeader locale={locale} nav={copy.nav} languageLabel={copy.languageLabel} languageHref={languageHref} />
      <main className={mainClassName} id="main-content">{children}</main>
      <SiteFooter locale={locale} />
    </>
  );
}
