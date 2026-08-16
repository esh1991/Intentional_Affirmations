import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // Generated portraits live on Vercel Blob (src/lib/portal/blob.ts). Without
    // this, next/image throws on a blob URL rather than rendering it. Scoped to
    // the blob host and its public path — `domains` is gone in Next 16, and
    // remotePatterns is the narrower grant anyway.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      // The browse hub retired at the M5 cutover. Anything that pointed at it
      // — old shares, the PWA start_url on an installed device, bookmarks —
      // lands on the portal instead of a 404.
      { source: "/practice", destination: "/portal", permanent: false },
      { source: "/practice/:path*", destination: "/portal", permanent: false },
      {
        source: "/",
        has: [{ type: "query", key: "mode" }],
        destination: "/portal",
        permanent: false,
      },
      // Old static-site URLs (indexed / linked externally)
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/faq.html", destination: "/faq", permanent: true },
      { source: "/resources.html", destination: "/science", permanent: true },
    ];
  },
};

export default nextConfig;
