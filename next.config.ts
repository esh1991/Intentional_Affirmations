import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      // Old static-site URLs (indexed / linked externally)
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/faq.html", destination: "/faq", permanent: true },
      // Points at / until the science page ships (Phase 1 M4)
      { source: "/resources.html", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
