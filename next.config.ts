import type { NextConfig } from "next";

// Build 100% estático: um .html por rota (pasta/index.html), sem servidor e sem rewrite.
const config: NextConfig = {
  allowedDevOrigins: ["100.82.153.65"],
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_AMBIENTE: process.env.AMBIENTE ?? "dev",
    NEXT_PUBLIC_MOCK: process.env.MOCK ?? (process.env.AMBIENTE ? "0" : "1"),
  },
};

export default config;
