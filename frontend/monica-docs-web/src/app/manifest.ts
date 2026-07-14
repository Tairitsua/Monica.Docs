import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Monica documentation",
    short_name: "Monica",
    description: "Observable application architecture for .NET teams.",
    start_url: "/",
    display: "standalone",
    background_color: "#f2eee5",
    theme_color: "#161713",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
