import { ImageResponse } from "next/og";

import { OpenGraphCard } from "@/app/open-graph-card";

export const alt = "Monica — 智能体可遵循的架构，人类可检查的系统。";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<OpenGraphCard locale="zh-CN" />, size);
}
