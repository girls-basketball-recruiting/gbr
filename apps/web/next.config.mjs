import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    // unoptimized: process.env.NODE_ENV === 'development',
  },
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     // Exclude Node.js built-ins and server-only modules from client bundle
  //     config.resolve.fallback = {
  //       ...config.resolve.fallback,
  //       net: false,
  //       tls: false,
  //       fs: false,
  //       dns: false,
  //       child_process: false,
  //       worker_threads: false,
  //       readline: false,
  //       perf_hooks: false,
  //       'node:assert': false,
  //       'node:async_hooks': false,
  //       'node:buffer': false,
  //       'node:stream': false,
  //       'node:util': false,
  //       'node:events': false,
  //       'node:crypto': false,
  //       'node:fs': false,
  //       'node:path': false,
  //       'node:os': false,
  //     };
  //   }
  //   return config;
  // },
};

export default withPayload(nextConfig);