import { NextRequest, NextResponse } from "next/server";

import type { Locale } from "@/content/home";
import { searchDocumentation } from "@/lib/documentation-api";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim().slice(0, 160) ?? "";
  const locale: Locale = request.nextUrl.searchParams.get("locale")?.toLowerCase() === "zh-cn" ? "zh-CN" : "en";

  if (!query) {
    return NextResponse.json({ results: [], source: "fallback" }, { headers: { "Cache-Control": "no-store" } });
  }

  const result = await searchDocumentation(locale, query);
  return NextResponse.json(
    { results: result.data, source: result.source },
    { headers: { "Cache-Control": "no-store" } },
  );
}
