// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

/** @type {import('next').NextConfig} */
module.exports = {
  output: 'standalone',
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    // this includes files from the monorepo base two directories up
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  async redirects() {
    return [
      {
        source: '/policies',
        destination: '/coverage',
        permanent: true,
      },
      {
        source: '/policies/:policy*',
        destination: '/coverage/policies/:policy*',
        permanent: true,
      },
    ];
  },
};
