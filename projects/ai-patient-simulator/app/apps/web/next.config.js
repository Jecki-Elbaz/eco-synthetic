// @ts-check
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  transpilePackages: ["@aps/shared-types"],
  // i18n config for Hebrew (RTL) + English [APS-REQ-082]
  i18n: {
    locales: ["he", "en"],
    defaultLocale: "he",
  },
};

module.exports = nextConfig;
