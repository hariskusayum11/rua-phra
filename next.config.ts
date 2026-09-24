import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  // Field photographs arrive straight off a camera; the default 1MB action body would
  // reject every one of them before sharp ever sees the file.
  experimental: { serverActions: { bodySizeLimit: "26mb" } },
};
export default config;
