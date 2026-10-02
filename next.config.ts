import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  // Ships a self-contained server with only the files it actually imports, so the
  // production image does not carry the whole of node_modules to the exhibition hall.
  output: "standalone",
  // Field photographs arrive straight off a camera; the default 1MB action body would
  // reject every one of them before sharp ever sees the file.
  experimental: { serverActions: { bodySizeLimit: "26mb" } },
};
export default config;
