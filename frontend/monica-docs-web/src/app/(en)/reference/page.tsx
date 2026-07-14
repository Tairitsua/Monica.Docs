import type { Metadata } from "next";

import { createLocalizedMetadata } from "@/app/site-metadata";
import { ReferencePage } from "@/components/launch/launch-pages";

export const metadata: Metadata = createLocalizedMetadata(
  "en",
  "/reference",
  "Executable reference",
  "Run the Monica template and Ordering reference application to inspect composition, boundaries, and runtime evidence.",
);

export default function EnglishReferencePage() {
  return <ReferencePage locale="en" />;
}
