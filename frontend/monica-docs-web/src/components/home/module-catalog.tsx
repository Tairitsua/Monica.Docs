"use client";

import { ArrowUpRight } from "lucide-react";
import { useState } from "react";

import { type Locale, type ModuleTier, packages } from "@/content/home";
import { localizedPath } from "@/lib/routes";

const tiers: readonly ModuleTier[] = ["stable", "integration", "labs"];

type ModuleCatalogProps = {
  locale: Locale;
  labels: readonly [string, string, string];
  descriptions: readonly [string, string, string];
  visibleLabel: string;
  catalogLabel: string;
};

export function ModuleCatalog({ locale, labels, descriptions, visibleLabel, catalogLabel }: ModuleCatalogProps) {
  const [selected, setSelected] = useState<ModuleTier>("stable");
  const selectedIndex = tiers.indexOf(selected);
  const visiblePackages = packages.filter((item) => item.tier === selected);

  return (
    <>
      <div className="tier-controls" role="group" aria-label="Filter module maturity">
        {tiers.map((tier, index) => (
          <button className={`tier-filter${selected === tier ? " is-active" : ""}`} type="button" key={tier} aria-pressed={selected === tier} onClick={() => setSelected(tier)}>
            <span className={`tier-dot ${tier === "integration" ? "integration" : tier}-dot`} /><b>{labels[index]}</b><i>{String(packages.filter((item) => item.tier === tier).length).padStart(2, "0")}</i>
          </button>
        ))}
      </div>
      <div className="tier-summary">
        <p>{descriptions[selectedIndex]}</p>
        <span><b>{String(visiblePackages.length).padStart(2, "0")}</b> {visibleLabel}</span>
      </div>
      <div className="module-catalog">
        {visiblePackages.map((item) => (
          <article className={`module-card${item.tier === "labs" ? " labs-card" : ""}`} key={`${item.tier}-${item.name}`}>
            <span>{item.prefix}</span><h3>{item.name}</h3><p>{item.description[locale]}</p><b>{item.role}</b>
          </article>
        ))}
      </div>
      <a className="catalog-link" href={localizedPath(locale, "/modules")}><span>{catalogLabel}</span><ArrowUpRight aria-hidden="true" size={15} /></a>
    </>
  );
}
