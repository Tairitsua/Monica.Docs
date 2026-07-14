import type { Metadata } from "next";

import { createLocalizedMetadata } from "@/app/site-metadata";
import { RoadmapPage } from "@/components/launch/launch-pages";

export const metadata: Metadata = createLocalizedMetadata(
  "en",
  "/roadmap",
  "Roadmap to 1.0",
  "The evidence-gated Monica 1.0 roadmap, current RC status, quality gates, and maturity promises.",
);

export default function EnglishRoadmapPage() {
  return <RoadmapPage locale="en" />;
}
