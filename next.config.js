/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, dev }) => {
    if (!config.experiments) {
      config.experiments = {};
    }
    config.experiments.topLevelAwait = true;
    config.experiments.asyncWebAssembly = true;

    if (!config.resolve) {
      config.resolve = {};
    }
    if (!config.resolve.fallback) {
      config.resolve.fallback = {};
    }

    config.resolve.fallback.punycode = false;

    config.ignoreWarnings = [{ module: /node_modules\/punycode/ }];

    // Handle WebAssembly files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    if (!dev) {
      config.devtool = false;
    }

    return config;
  },
  // ... existing code ...
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // // Warning: This allows production builds to successfully complete even if
    // // your project has ESLint errors.
    // ignoreDuringBuilds: true,
    dirs: ["src"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ljgeudksovj3bfbx.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // ... existing code ...
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://eu.i.posthog.com/decide",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;