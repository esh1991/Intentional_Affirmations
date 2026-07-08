import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      // The app hub moved from / to /practice; old ?mode= deep links (science
      // page, shares) follow it. Query values pass through automatically.
      {
        source: "/",
        has: [{ type: "query", key: "mode" }],
        destination: "/practice",
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
