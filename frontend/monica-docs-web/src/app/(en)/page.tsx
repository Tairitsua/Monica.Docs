import type { Metadata } from "next";

import { HomePage } from "@/components/home/home-page";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: { en: "/", "zh-CN": "/zh-CN" },
  },
};

export default function EnglishHomePage() {
  return <HomePage locale="en" />;
}
