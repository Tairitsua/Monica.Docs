import { ImageResponse } from "next/og";

import { OpenGraphCard } from "@/app/open-graph-card";

export const alt = "Monica — Architecture agents can follow. Systems humans can inspect.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<OpenGraphCard locale="en" />, size);
}
