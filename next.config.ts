import type { NextConfig } from "next";

/** Hostname of the bucket serving uploaded media, when one is configured. */
const mediaHost = (() => {
  const base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.trim();
  if (!base) return null;
  try {
    return new URL(base).hostname;
  } catch {
    return null;
  }
})();
const config: NextConfig = {
  poweredByHeader: false,
  // Ships a self-contained server with only the files it actually imports, so the
  // production image does not carry the whole of node_modules to the exhibition hall.
  output: "standalone",
  // Field photographs arrive straight off a camera; the default 1MB action body would
  // reject every one of them before sharp ever sees the file. The browser shrinks them
  // first, so in practice what arrives is well under a megabyte — this is the ceiling for
  // anything the browser could not decode and passed through untouched.
  experimental: { serverActions: { bodySizeLimit: "26mb" } },
  images: {
    // Uploaded media is served from object storage in production. The host comes from the
    // environment because it differs per deployment, and Next will not load a remote image
    // from a host it was not told about at build time.
    remotePatterns: mediaHost ? [{ protocol: "https", hostname: mediaHost }] : [],
  },
};
export default config;
