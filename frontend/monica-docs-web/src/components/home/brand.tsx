import Link from "next/link";

import { monicaRelease } from "@/lib/monica-release";

type BrandProps = {
  homeHref: string;
  compact?: boolean;
};

export function Brand({ homeHref, compact = false }: BrandProps) {
  return (
    <Link className="brand" href={homeHref} aria-label="Monica home">
      <span className={`monica-mark${compact ? " small-mark" : ""}`} aria-hidden="true">
        <span className="mark-plane mark-plane-violet" />
        <span className="mark-plane mark-plane-ink" />
        <span className="mark-cut" />
      </span>
      <span className="brand-name">monica</span>
      {!compact && <span className="release-stamp">{monicaRelease.label}</span>}
    </Link>
  );
}
