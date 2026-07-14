import { NextRequest, NextResponse } from "next/server";

import { getDocumentationApiBaseUrl } from "@/lib/documentation-api";

const ASSET_ENDPOINT = "/api/v1/Documentation/assets";
const FORWARDED_REQUEST_HEADERS = [
  "accept",
  "if-modified-since",
  "if-none-match",
  "if-range",
  "range",
] as const;
const FORWARDED_RESPONSE_HEADERS = [
  "accept-ranges",
  "content-length",
  "content-range",
  "content-type",
  "etag",
  "last-modified",
] as const;

export async function GET(request: NextRequest) {
  const assetPath = request.nextUrl.searchParams.get("assetPath")?.trim().replaceAll("\\", "/");
  const baseUrl = getDocumentationApiBaseUrl();

  if (!assetPath || !baseUrl || assetPath.startsWith("/") || assetPath.split("/").some(isPrivateAssetSegment)) {
    return NextResponse.json({ error: "Documentation asset unavailable." }, { status: 404 });
  }

  const url = new URL(`${baseUrl}${ASSET_ENDPOINT}`);
  url.searchParams.set("assetPath", assetPath);

  try {
    const requestHeaders = new Headers();
    for (const name of FORWARDED_REQUEST_HEADERS) {
      const value = request.headers.get(name);
      if (value) {
        requestHeaders.set(name, value);
      }
    }

    const isConditionalOrRangeRequest = requestHeaders.has("range")
      || requestHeaders.has("if-none-match")
      || requestHeaders.has("if-modified-since")
      || requestHeaders.has("if-range");
    const upstream = await fetch(url, {
      headers: requestHeaders,
      ...(isConditionalOrRangeRequest
        ? { cache: "no-store" as const }
        : { next: { revalidate: 300 } }),
    });
    if (upstream.status === 304) {
      return new NextResponse(null, {
        status: 304,
        headers: copyAssetResponseHeaders(upstream.headers),
      });
    }

    if ((!upstream.ok && upstream.status !== 206) || !upstream.body) {
      return NextResponse.json({ error: "Documentation asset unavailable." }, { status: upstream.status === 404 ? 404 : 502 });
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: copyAssetResponseHeaders(upstream.headers),
    });
  } catch {
    return NextResponse.json({ error: "Documentation asset unavailable." }, { status: 502 });
  }
}

function isPrivateAssetSegment(segment: string): boolean {
  const normalizedSegment = segment.toLowerCase();
  return normalizedSegment.startsWith(".")
    || normalizedSegment === "bin"
    || normalizedSegment === "obj"
    || normalizedSegment === "node_modules"
    || normalizedSegment === "packages";
}

function copyAssetResponseHeaders(upstreamHeaders: Headers): Headers {
  const headers = new Headers({
    "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
  });

  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstreamHeaders.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  if (!headers.has("content-type")) {
    headers.set("content-type", "application/octet-stream");
  }

  return headers;
}
