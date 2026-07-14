import type { Metadata } from "next";

import { HomePage } from "@/components/home/home-page";

export const metadata: Metadata = {
  title: "Monica — 可观测的 .NET 应用架构",
  description: "智能体可遵循的架构，人类可检查的系统。Monica 为 .NET 团队提供明确、可组合、可观测的应用模型。",
  alternates: {
    canonical: "/zh-CN",
    languages: { en: "/", "zh-CN": "/zh-CN" },
  },
  openGraph: {
    locale: "zh_CN",
    title: "Monica — 可观测的 .NET 应用架构",
    description: "智能体可遵循的架构，人类可检查的系统。",
    url: "/zh-CN",
  },
};

export default function ChineseHomePage() {
  return <HomePage locale="zh-CN" />;
}
