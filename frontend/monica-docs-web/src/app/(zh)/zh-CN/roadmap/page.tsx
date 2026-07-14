import type { Metadata } from "next";

import { createLocalizedMetadata } from "@/app/site-metadata";
import { RoadmapPage } from "@/components/launch/launch-pages";

export const metadata: Metadata = createLocalizedMetadata(
  "zh-CN",
  "/roadmap",
  "通往 1.0 的路线图",
  "了解 Monica 1.0 以证据为门禁的路线图、当前 RC 状态、质量门禁与成熟度承诺。",
);

export default function ChineseRoadmapPage() {
  return <RoadmapPage locale="zh-CN" />;
}
