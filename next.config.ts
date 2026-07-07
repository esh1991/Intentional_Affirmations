import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      // Old static-site URLs (indexed / linked externally)
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/faq.html", destination: "/faq", permanent: true },
      { source: "/resources.html", destination: "/science", permanent: true },
    ];
  },
};

export default nextConfig;
