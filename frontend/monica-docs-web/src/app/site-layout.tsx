import type { ReactNode } from "react";

import type { Locale } from "@/content/home";

export function SiteLayout({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
