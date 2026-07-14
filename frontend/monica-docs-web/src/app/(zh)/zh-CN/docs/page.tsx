import type { Metadata } from "next";

import { createLocalizedMetadata } from "@/app/site-metadata";
import { DocsLandingPage } from "@/components/docs/docs-pages";

export const revalidate = 300;

export const metadata: Metadata = createLocalizedMetadata(
  "zh-CN",
  "/docs",
  "使用文档",
  "了解 Monica 应用架构、模块组合与运行时证据的可执行指南。",
);

export default function ChineseDocsPage() {
  return <DocsLandingPage locale="zh-CN" />;
}
