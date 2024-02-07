/** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: ["@zdx/bloom"],
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};
