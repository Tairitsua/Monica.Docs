import type { MetadataRoute } from "next";

import { siteUrl } from "@/app/site-metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
