import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cortex AI",
    short_name: "Cortex",
    description: "Document-grounded AI assistant for Cortex workspaces.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f7f7",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "64x64",
        type: "image/svg+xml"
      }
    ]
  };
}
