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
  // If you change these and need to test the changes, remember to go to network tab in browser tools
  // and check Disable cache to ensure you are seeing your updated version
  async redirects() {
    return [
      {
        source: '/policies',
        destination: '/coverage',
        permanent: true,
      },
      {
        source: '/policies/:planCode*',
        destination: '/coverage/policies/:planCode*',
        permanent: true,
      },
    ];
  },
};
