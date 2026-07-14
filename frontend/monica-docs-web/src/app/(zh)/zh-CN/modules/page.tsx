import type { Metadata } from "next";

import { createLocalizedMetadata } from "@/app/site-metadata";
import { ModulesPage } from "@/components/launch/launch-pages";

export const metadata: Metadata = createLocalizedMetadata(
  "zh-CN",
  "/modules",
  "模块目录",
  "按 Stable、生态集成与 Labs 成熟度层级浏览完整 Monica 包目录。",
);

export default function ChineseModulesPage() {
  return <ModulesPage locale="zh-CN" />;
}
