import type { Metadata } from "next";

import { createLocalizedMetadata } from "@/app/site-metadata";
import { ReferencePage } from "@/components/launch/launch-pages";

export const metadata: Metadata = createLocalizedMetadata(
  "zh-CN",
  "/reference",
  "可执行参考",
  "运行 Monica 模板与 Ordering 参考应用，检查组合、边界与运行时证据。",
);

export default function ChineseReferencePage() {
  return <ReferencePage locale="zh-CN" />;
}
